import { getPatients } from "../controllers/patient.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getPatients);
router.get("/:id", getPatientProfile);

export default router;
