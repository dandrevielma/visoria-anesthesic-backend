import { Selectable } from "kysely";
import { User } from ".";

declare global {
  namespace Express {
    interface Request {
      user_id: string;
      user: Selectable<User>;
    }
  }
}
