import { db } from "@/lib/db";
import { User } from "@/types";
import { Selectable } from "kysely";

export async function updateUser(id: string, data: any) {
  await db.updateTable("user").set(data).where("id", "=", id).execute();
}

export async function getUser(
  id: string
): Promise<Selectable<User> | undefined> {
  return await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}
