import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { db } from "@/lib/db";

const f = createUploadthing();

const fileTypeSchema = z.enum([
  "prescription",
  "lab_result",
  "imaging",
  "ecg",
  "medical_report",
  "other",
]);

export const uploadRouter = {
  recordDocuments: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "2MB", maxFileCount: 5 },
    blob: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .input(
      z.object({
        recordId: z.string().uuid(),
        fileType: fileTypeSchema.optional(),
      })
    )
    .middleware(async ({ input }) => {
      console.log("[uploadthing] middleware", { input });

      const record = await db
        .selectFrom("record")
        .select(["id", "patient_id"])
        .where("id", "=", input.recordId)
        .executeTakeFirst();

      if (!record) {
        throw new UploadThingError("Record not found");
      }

      return {
        recordId: input.recordId,
        patientId: record.patient_id,
        fileType: input.fileType ?? "other",
      };
    })
    .onUploadError(({ error, fileKey }) => {
      console.error("[uploadthing] upload error", {
        fileKey,
        error: error.message,
      });
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[uploadthing] onUploadComplete", {
        recordId: metadata.recordId,
        patientId: metadata.patientId,
        fileName: file.name,
        fileKey: file.key,
        fileUrl: file.url,
      });

      try {
        await db
          .insertInto("patient_file")
          .values({
            patient_id: metadata.patientId,
            record_id: metadata.recordId,
            file_type: metadata.fileType,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type ?? "application/octet-stream",
            storage_path: file.key,
            storage_url: file.url,
            uploaded_by: null,
          })
          .execute();

        console.log("[uploadthing] stored patient_file", {
          recordId: metadata.recordId,
          fileKey: file.key,
        });
      } catch (error) {
        console.error("[uploadthing] failed to store patient_file", {
          recordId: metadata.recordId,
          fileKey: file.key,
          error,
        });
        throw new UploadThingError("Failed to store uploaded file");
      }

      return {
        recordId: metadata.recordId,
        fileUrl: file.url,
        fileKey: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
