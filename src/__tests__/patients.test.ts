import request from "supertest";
import { Express } from "express";
import express from "express";
import { patientsRouter } from "@/routes/patients";
import { db } from "@/lib/db";

// Create test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use("/api/patients", patientsRouter);
  return app;
};

describe("Patients API", () => {
  let app: Express;
  let createdPatientId: string;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up test data
    if (createdPatientId) {
      await db
        .deleteFrom("patient")
        .where("id", "=", createdPatientId)
        .execute();
    }
  });

  describe("POST /api/patients", () => {
    it("should create a new patient", async () => {
      const newPatient = {
        identification_number: `TEST-${Date.now()}`,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        date_of_birth: "1990-01-01",
      };

      const response = await request(app)
        .post("/api/patients")
        .send(newPatient)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.first_name).toBe("John");
      expect(response.body.last_name).toBe("Doe");
      expect(response.body.identification_number).toBe(newPatient.identification_number);

      // Save for cleanup
      createdPatientId = response.body.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const invalidPatient = {
        first_name: "John",
        // Missing identification_number and last_name
      };

      const response = await request(app)
        .post("/api/patients")
        .send(invalidPatient)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 if identification_number already exists", async () => {
      const duplicatePatient = {
        identification_number: `TEST-${Date.now()}`,
        first_name: "Jane",
        last_name: "Doe",
      };

      // Create first patient
      await request(app)
        .post("/api/patients")
        .send(duplicatePatient)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/patients")
        .send(duplicatePatient)
        .expect(400);

      expect(response.body.error).toContain("already exists");
    });
  });

  describe("GET /api/patients", () => {
    it("should list all patients", async () => {
      const response = await request(app)
        .get("/api/patients")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should search patients by name", async () => {
      const response = await request(app)
        .get("/api/patients")
        .query({ search: "John" })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const response = await request(app)
        .get("/api/patients")
        .query({ limit: "5" })
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /api/patients/:id", () => {
    it("should get a patient by ID", async () => {
      // First create a patient
      const newPatient = {
        identification_number: `TEST-GET-${Date.now()}`,
        first_name: "Test",
        last_name: "User",
      };

      const createResponse = await request(app)
        .post("/api/patients")
        .send(newPatient);

      const patientId = createResponse.body.id;

      // Get the patient
      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .expect(200);

      expect(response.body.id).toBe(patientId);
      expect(response.body.first_name).toBe("Test");
    });

    it("should return 404 for non-existent patient", async () => {
      const response = await request(app)
        .get("/api/patients/00000000-0000-0000-0000-000000000000")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/patients/identification/:idNumber", () => {
    it("should find patient by identification number", async () => {
      const idNumber = `TEST-FIND-${Date.now()}`;
      
      // Create patient
      await request(app)
        .post("/api/patients")
        .send({
          identification_number: idNumber,
          first_name: "Find",
          last_name: "Me",
        });

      // Find by identification number
      const response = await request(app)
        .get(`/api/patients/identification/${idNumber}`)
        .expect(200);

      expect(response.body.identification_number).toBe(idNumber);
    });

    it("should return 404 for non-existent identification number", async () => {
      await request(app)
        .get("/api/patients/identification/NONEXISTENT")
        .expect(404);
    });
  });

  describe("PUT /api/patients/:id", () => {
    it("should update a patient", async () => {
      // Create patient
      const createResponse = await request(app)
        .post("/api/patients")
        .send({
          identification_number: `TEST-UPDATE-${Date.now()}`,
          first_name: "Old",
          last_name: "Name",
        });

      const patientId = createResponse.body.id;

      // Update patient
      const response = await request(app)
        .put(`/api/patients/${patientId}`)
        .send({
          first_name: "New",
          last_name: "Name",
        })
        .expect(200);

      expect(response.body.first_name).toBe("New");
      expect(response.body.last_name).toBe("Name");
    });

    it("should return 404 for non-existent patient", async () => {
      await request(app)
        .put("/api/patients/00000000-0000-0000-0000-000000000000")
        .send({ first_name: "Test" })
        .expect(404);
    });
  });

  describe("DELETE /api/patients/:id", () => {
    it("should delete a patient without records", async () => {
      // Create patient
      const createResponse = await request(app)
        .post("/api/patients")
        .send({
          identification_number: `TEST-DELETE-${Date.now()}`,
          first_name: "Delete",
          last_name: "Me",
        });

      const patientId = createResponse.body.id;

      // Delete patient
      const response = await request(app)
        .delete(`/api/patients/${patientId}`)
        .expect(200);

      expect(response.body.message).toContain("deleted successfully");
    });

    it("should return 404 for non-existent patient", async () => {
      await request(app)
        .delete("/api/patients/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });
});
