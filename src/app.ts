import express from "express";
import patientRouter from "./routes/patient.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import demoRouter from "./routes/demo.routes.js";
import { apiModeMiddleware } from "./middleware/api-mode.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

// Enforce Portfolio read-only or Demo CRUD mode.
app.use(apiModeMiddleware);

// Demo reset endpoint
app.use("/api/demo", demoRouter);

// Existing API routes
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
