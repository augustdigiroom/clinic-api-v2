import patientRouter from "./routes/patient.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import express from "express";

const app = express();

app.use(express.json());

app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);

app.listen(5000);
