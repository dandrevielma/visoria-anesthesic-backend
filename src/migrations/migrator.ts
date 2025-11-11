import { db } from "@/lib/db";
import { Migrator, FileMigrationProvider } from "kysely";
import { promises as fs } from "fs";
import path from "path";

export async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`✅ Migration "${it.migrationName}" executed successfully`);
    } else if (it.status === "Error") {
      console.error(`❌ Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("❌ Failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

export async function migrateDown() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`✅ Migration "${it.migrationName}" reverted successfully`);
    } else if (it.status === "Error") {
      console.error(`❌ Failed to revert migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("❌ Failed to revert migration");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}
