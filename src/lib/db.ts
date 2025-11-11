import "dotenv/config";
import { DB } from "@/types"; // this is the Database interface we defined earlier
import { Pool, types } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<DB>({
  log: ["query", "error"],
  dialect,
});
