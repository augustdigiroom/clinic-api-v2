import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
} from "../controllers/appointment.controller.js";

import { Router } from "express";

const router = Router();

router.get("/", getAppointments);

router.get("/patient/:patientId", getAppointmentsByPatient);
router.get("/doctor/:doctorId", getAppointmentsByDoctor);

router.get("/:id", getAppointment);

router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
