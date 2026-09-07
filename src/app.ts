import patientRouter from "./routes/patient.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import express from "express";

const app = express();

app.use(express.json());

app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);

app.listen(5000);
