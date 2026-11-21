import express from "express";
import cors from "cors";

import patientRouter from "./routes/patient.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import demoRouter from "./routes/demo.routes.js";

import { apiModeMiddleware } from "./middleware/api-mode.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Read the explicitly allowed frontend origins.
// Multiple origins can be separated by commas.
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Default to Portfolio restrictions if API_MODE is missing
// or contains an unexpected value.
const isDemoMode = process.env.API_MODE === "demo";

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,

  methods: isDemoMode ? ["GET", "POST", "PATCH", "DELETE"] : ["GET", "HEAD"],

  allowedHeaders: ["Content-Type"],

  credentials: false,

  maxAge: 600,
};

const app = express();

// CORS must run before JSON parsing, API mode protection,
// and application routes. This also handles OPTIONS preflight.
app.use(cors(corsOptions));

app.use(express.json());

// Enforce Portfolio read-only or Demo CRUD mode.
app.use(apiModeMiddleware);

// Demo reset endpoint.
app.use("/api/demo", demoRouter);

// Existing API routes.
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);

// Handle unknown routes.
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handling.
app.use(errorHandler);

export default app;
