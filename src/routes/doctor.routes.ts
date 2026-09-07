import {
  getDoctors,
  getDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";

import { Router } from "express";

const router = Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorProfile);
router.post("/", createDoctor);
router.patch("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;
