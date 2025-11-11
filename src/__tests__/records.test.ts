import request from "supertest";
import { Express } from "express";
import express from "express";
import { recordsRouter } from "@/routes/records";
import { db } from "@/lib/db";

// Create test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use("/api/records", recordsRouter);
  // Include patients router for patient creation in tests
  app.use("/api/patients", require("@/routes/patients").patientsRouter);
  return app;
};

describe("Records API", () => {
  let app: Express;
  let testPatientId: string;
  let testRecordId: string;
  let testUserId: string;

  beforeAll(async () => {
    app = createTestApp();
    
    // Check if test user already exists, if not create it
    let existingUser = await db
      .selectFrom("user")
      .select("id")
      .where("id", "=", "test-user-id")
      .executeTakeFirst();

    if (!existingUser) {
      const testUser = await db
        .insertInto("user")
        .values({
          id: "test-user-id",
          email: `test-records-${Date.now()}@example.com`,
          emailVerified: 0,
          name: "Test User",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning("id")
        .executeTakeFirst();
      
      testUserId = testUser!.id;
    } else {
      testUserId = existingUser.id;
    }
    
    // Create test patient
    const patient = await db
      .insertInto("patient")
      .values({
        identification_number: "12345678",
        first_name: "Test",
        last_name: "Patient",
      })
      .returning("id")
      .executeTakeFirst();
    
    testPatientId = patient!.id;
  });

  afterAll(async () => {
    // Clean up test record first (foreign key constraint)
    if (testRecordId) {
      await db
        .deleteFrom("record")
        .where("id", "=", testRecordId)
        .execute();
    }
    
    // Clean up any records that reference the test user
    await db
      .deleteFrom("record")
      .where("created_by", "=", "test-user-id")
      .execute();
    
    // Clean up test patient
    if (testPatientId) {
      await db
        .deleteFrom("patient")
        .where("id", "=", testPatientId)
        .execute();
    }
    
    // Clean up test user (now safe to delete)
    if (testUserId) {
      await db
        .deleteFrom("user")
        .where("id", "=", testUserId)
        .execute();
    }
  });

  describe("POST /api/records", () => {
    it("should create a new record with auto-generated record number and token", async () => {
      const newRecord = {
        patient_id: testPatientId,
        type: "pre_anesthesia",
        scheduled_date: "2025-06-01T10:00:00Z",
      };

      const response = await request(app)
        .post("/api/records")
        .send(newRecord)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("record_number");
      expect(response.body.record_number).toMatch(/^REC-\d{4}-\d{4}$/);
      expect(response.body).toHaveProperty("form_link_token");
      expect(response.body.form_link_token).toHaveLength(64);
      expect(response.body.patient_id).toBe(testPatientId);
      expect(response.body.type).toBe("pre_anesthesia");
      expect(response.body.status).toBe("pending");
      expect(response.body.created_by).toBe("test-user-id");

            // Store for cleanup
      testRecordId = response.body.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const invalidRecord = {
        patient_id: testPatientId,
        // Missing type
      };

      const response = await request(app)
        .post("/api/records")
        .send(invalidRecord)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 if patient does not exist", async () => {
      const invalidRecord = {
        patient_id: "00000000-0000-0000-0000-000000000000",
        type: "pre_anesthesia",
      };

      const response = await request(app)
        .post("/api/records")
        .send(invalidRecord)
        .expect(404);

      expect(response.body.error).toContain("Patient not found");
    });

    it("should return 400 for invalid record type", async () => {
      const invalidRecord = {
        patient_id: testPatientId,
        type: "invalid_type",
      };

      const response = await request(app)
        .post("/api/records")
        .send(invalidRecord)
        .expect(400);

      expect(response.body.error).toContain("type must be");
    });
  });

  describe("GET /api/records", () => {
    it("should list all records", async () => {
      const response = await request(app)
        .get("/api/records")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should filter records by patient_id", async () => {
      // First, create a patient
      const patientResponse = await request(app)
        .post("/api/patients")
        .send({
          identification_number: `TEST-FILTER-${Date.now()}`,
          first_name: "Filter",
          last_name: "Test",
          date_of_birth: new Date("1985-05-15").toISOString(),
          phone: "+1234567890",
          email: "filter@test.com",
        })
        .expect(201);

      const patientId = patientResponse.body.id;

      // Create a record for this patient
      await request(app)
        .post("/api/records")
        .send({
          patient_id: patientId,
          type: "pre_anesthesia",
          status: "pending",
        })
        .expect(201);

      // Filter by patient_id
      const response = await request(app)
        .get("/api/records")
        .query({ patient_id: patientId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((record: any) => {
        expect(record.patient_id).toBe(patientId);
      });
    });

    it("should filter records by status", async () => {
      const response = await request(app)
        .get("/api/records")
        .query({ status: "pending" })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((record: any) => {
        expect(record.status).toBe("pending");
      });
    });

    it("should filter records by type", async () => {
      const response = await request(app)
        .get("/api/records")
        .query({ type: "pre_anesthesia" })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((record: any) => {
        expect(record.type).toBe("pre_anesthesia");
      });
    });

    it("should respect limit parameter", async () => {
      const response = await request(app)
        .get("/api/records")
        .query({ limit: "5" })
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /api/records/:id", () => {
    it("should get full record details with all related data", async () => {
      // Create a record first
      const createResponse = await request(app)
        .post("/api/records")
        .send({
          patient_id: testPatientId,
          type: "post_anesthesia",
          scheduled_date: "2025-06-15T14:00:00Z",
        });

      const recordId = createResponse.body.id;

      // Get full details
      const response = await request(app)
        .get(`/api/records/${recordId}`)
        .expect(200);

      expect(response.body.record.id).toBe(recordId);
      expect(response.body.record.patient_id).toBe(testPatientId);
      expect(response.body).toHaveProperty("patient_form");
      expect(response.body).toHaveProperty("doctor_evaluation");
      expect(response.body).toHaveProperty("consent");
      expect(response.body).toHaveProperty("files");
      expect(Array.isArray(response.body.files)).toBe(true);
    });

    it("should return 404 for non-existent record", async () => {
      const response = await request(app)
        .get("/api/records/00000000-0000-0000-0000-000000000000")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/records/:id", () => {
    it("should update a record", async () => {
      // Create record
      const createResponse = await request(app)
        .post("/api/records")
        .send({
          patient_id: testPatientId,
          type: "pre_anesthesia",
        });

      const recordId = createResponse.body.id;

      // Update record
      const response = await request(app)
        .put(`/api/records/${recordId}`)
        .send({
          status: "completed",
          notes: "Test notes",
        })
        .expect(200);

      expect(response.body.status).toBe("completed");
      expect(response.body.notes).toBe("Test notes");
    });

    it("should return 400 for invalid status", async () => {
      // Create record
      const createResponse = await request(app)
        .post("/api/records")
        .send({
          patient_id: testPatientId,
          type: "pre_anesthesia",
        });

      const recordId = createResponse.body.id;

      // Try to update with invalid status
      const response = await request(app)
        .put(`/api/records/${recordId}`)
        .send({
          status: "invalid_status",
        })
        .expect(400);

      expect(response.body.error).toContain("Invalid status");
    });

    it("should return 404 for non-existent record", async () => {
      await request(app)
        .put("/api/records/00000000-0000-0000-0000-000000000000")
        .send({ status: "completed" })
        .expect(404);
    });
  });

  describe("DELETE /api/records/:id", () => {
    it("should delete a record and all related data", async () => {
      // Create record
      const createResponse = await request(app)
        .post("/api/records")
        .send({
          patient_id: testPatientId,
          type: "pre_anesthesia",
        });

      const recordId = createResponse.body.id;

      // Delete record
      const response = await request(app)
        .delete(`/api/records/${recordId}`)
        .expect(200);

      expect(response.body.message).toContain("deleted successfully");

      // Verify record is deleted
      await request(app)
        .get(`/api/records/${recordId}`)
        .expect(404);
    });

    it("should return 404 for non-existent record", async () => {
      await request(app)
        .delete("/api/records/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });
});
