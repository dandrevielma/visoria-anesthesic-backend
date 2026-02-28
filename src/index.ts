import "dotenv/config";
import express, { Request, Response } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { exampleRouter } from "./routes/example";
import { rolesRouter } from "./routes/roles";
import { patientsRouter } from "./routes/patients";
import { recordsRouter } from "./routes/records";
import patientFormsRouter from "./routes/patientForms";
import { errorHandler } from "./middleware/errorHandler";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import cors from "cors";
const app = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://example.com",
  "https://visoria-anesthesic-frontend-production.up.railway.app",
  "https://visoria-anesthesic-frontend.vercel.app",
  "https://anestesiologos.visoriaconsulting.com",
];

const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...defaultAllowedOrigins, ...envAllowedOrigins]),
);

// Trust proxy MUST be set before any middleware
app.set("trust proxy", true);

// Debug: Log environment variables related to auth
console.log('=== Auth Debug Info ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('Trust Proxy:', app.get('trust proxy'));
console.log('=====================');

// Middleware to fix SameSite cookies for cross-site auth
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      const cookies = Array.isArray(value) ? value : [value];
      const fixedCookies = cookies.map((cookie: string) => {
        // Replace SameSite=Lax with SameSite=None for production
        return cookie.replace(/SameSite=Lax/gi, 'SameSite=None');
      });
      return originalSetHeader.call(this, name, fixedCookies);
    }
    return originalSetHeader.call(this, name, value);
  };
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));

app.use(
  express.json({
    verify: (req, _res, buf) => {
      // store raw buffer for later verification
      (req as any).rawBody = buf;
    },
  }),
);
const port = 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/example", exampleRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/patient-forms", patientFormsRouter); // Public patient forms (no auth)
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
      callbackUrl: `${process.env.BASE_URL ?? "http://localhost:8080"}/api/uploadthing`,
    },
  }),
); // Public uploadthing route
app.use("/api/records", recordsRouter); // Protected records routes

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
