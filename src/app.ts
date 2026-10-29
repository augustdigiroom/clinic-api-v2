import express from "express";
import patientRouter from "./routes/patient.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";

const app = express();

app.use(express.json());

app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);

export default app;
