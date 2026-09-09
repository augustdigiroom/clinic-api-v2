import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";

import { Router } from "express";

const router = Router();

router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
