import "dotenv/config";
import express, { Request, Response } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { exampleRouter } from "./routes/example";
import { rolesRouter } from "./routes/roles";
import { patientsRouter } from "./routes/patients";
import { recordsRouter } from "./routes/records";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'https://example.com'],
    credentials: true,
  })
);

app.set("trust proxy", true);
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));

app.use(
  express.json({
    verify: (req, _res, buf) => {
      // store raw buffer for later verification
      (req as any).rawBody = buf;
    },
  })
);
const port = 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/example", exampleRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/records", recordsRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
