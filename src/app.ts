import patientRouter from "./routes/patient.routes.js";
import express from "express";

const app = express();

app.use(express.json());

app.use("/api/patients", patientRouter);

app.listen(5000);
