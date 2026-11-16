import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import {
  appointmentsToSeed,
  doctorsToSeed,
  patientsToSeed,
} from "../lib/demo-data.js";

const RESET_COOLDOWN_MS = 60_000;

let lastResetAt = 0;
let resetInProgress = false;

export const resetDemoData: RequestHandler = async (_req, res, next) => {
  // Require an explicit Demo API configuration.
  if (process.env.API_MODE !== "demo") {
    return res.status(403).json({
      success: false,
      message: "Demo reset is not enabled on this API.",
    });
  }

  // Verify that the connection targets Neon.
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return res.status(500).json({
      success: false,
      message: "Database configuration is missing.",
    });
  }

  let databaseUrl: URL;

  try {
    databaseUrl = new URL(connectionString);
  } catch {
    return res.status(500).json({
      success: false,
      message: "Invalid database configuration.",
    });
  }

  if (!databaseUrl.hostname.endsWith(".neon.tech")) {
    return res.status(403).json({
      success: false,
      message: "Reset is only allowed on the Neon Demo database.",
    });
  }

  // Verify the actual PostgreSQL role and database.
  try {
    const identity = await prisma.$queryRaw<
      Array<{
        current_user: string;
        current_database: string;
      }>
    >`
      SELECT
        current_user,
        current_database() AS current_database
    `;

    const databaseIdentity = identity[0];

    if (
      databaseIdentity?.current_user !== "clinic_demo_app" ||
      databaseIdentity?.current_database !== "neondb"
    ) {
      return res.status(403).json({
        success: false,
        message: "Database identity is not authorized for Demo reset.",
      });
    }
  } catch (error: unknown) {
    return next(error);
  }

  // Prevent simultaneous reset operations.
  if (resetInProgress) {
    return res.status(409).json({
      success: false,
      message: "A Demo reset is already in progress.",
    });
  }

  // Apply a 60-second cooldown.
  const remainingCooldown = RESET_COOLDOWN_MS - (Date.now() - lastResetAt);

  if (lastResetAt > 0 && remainingCooldown > 0) {
    return res.status(429).json({
      success: false,
      message: "Please wait before resetting Demo data again.",
      retryAfterSeconds: Math.ceil(remainingCooldown / 1000),
    });
  }

  resetInProgress = true;

  try {
    const counts = await prisma.$transaction(async (tx) => {
      // Delete in foreign-key-safe order.
      await tx.appointments.deleteMany();
      await tx.patients.deleteMany();
      await tx.doctors.deleteMany();

      const doctorIds = new Map<string, number>();

      // Restore doctors.
      for (const doctorData of doctorsToSeed) {
        const doctor = await tx.doctors.create({
          data: {
            first_name: doctorData.first_name,
            last_name: doctorData.last_name,
            specialization: doctorData.specialization,
          },
        });

        doctorIds.set(doctorData.key, doctor.id);
      }

      const patientIds = new Map<string, number>();

      // Restore patients and their doctor relationships.
      for (const patientData of patientsToSeed) {
        const doctorId = doctorIds.get(patientData.doctorKey);

        if (doctorId === undefined) {
          throw new Error(`Doctor not found: ${patientData.doctorKey}`);
        }

        const patient = await tx.patients.create({
          data: {
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            age: patientData.age,
            gender: patientData.gender,
            diagnosis: patientData.diagnosis,
            contact_number: patientData.contact_number,
            doctor_id: doctorId,
          },
        });

        patientIds.set(patientData.contact_number, patient.id);
      }

      // Restore appointments and their relationships.
      for (const appointmentData of appointmentsToSeed) {
        const patientId = patientIds.get(appointmentData.patientContact);

        const doctorId = doctorIds.get(appointmentData.doctorKey);

        if (patientId === undefined || doctorId === undefined) {
          throw new Error("Patient or doctor reference not found.");
        }

        await tx.appointments.create({
          data: {
            patient_id: patientId,
            doctor_id: doctorId,
            appointment_date: new Date(appointmentData.appointment_date),
            reason: appointmentData.reason,
            status: appointmentData.status,
          },
        });
      }

      return {
        doctors: doctorIds.size,
        patients: patientIds.size,
        appointments: appointmentsToSeed.length,
      };
    });

    lastResetAt = Date.now();

    return res.status(200).json({
      success: true,
      message: "Demo data reset successfully.",
      data: counts,
    });
  } catch (error: unknown) {
    return next(error);
  } finally {
    resetInProgress = false;
  }
};
