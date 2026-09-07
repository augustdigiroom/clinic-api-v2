import {
  getPatients,
  getPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";

import { Router } from "express";

const router = Router();

router.get("/", getPatients);
router.get("/:id", getPatientProfile);
router.post("/", createPatient);
router.patch("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
