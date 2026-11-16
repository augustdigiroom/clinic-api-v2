import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  appointmentsToSeed,
  doctorsToSeed,
  patientsToSeed,
} from "../src/lib/demo-data.js";

// ========================================
// 1. DATABASE CONNECTION + SAFETY CHECK
// ========================================

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your .env file.");
}

const databaseUrl = new URL(connectionString);

// Prevent accidental seeding of local PostgreSQL.
if (!databaseUrl.hostname.endsWith(".neon.tech")) {
  throw new Error(
    "SAFETY STOP: This seed script only runs against Neon. " +
      "No records were added.",
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ========================================
// 2. SEED DATABASE
// ========================================

async function main() {
  console.log("Starting Neon database seeding...");

  const doctorIds = new Map<string, number>();

  // Create or reuse doctors.
  for (const doctorData of doctorsToSeed) {
    const existingDoctor = await prisma.doctors.findFirst({
      where: {
        first_name: doctorData.first_name,
        last_name: doctorData.last_name,
        specialization: doctorData.specialization,
      },
    });

    const doctor =
      existingDoctor ??
      (await prisma.doctors.create({
        data: {
          first_name: doctorData.first_name,
          last_name: doctorData.last_name,
          specialization: doctorData.specialization,
        },
      }));

    doctorIds.set(doctorData.key, doctor.id);
  }

  console.log("Doctors seeded successfully.");

  const patientIds = new Map<string, number>();

  // Create or update patients.
  for (const patientData of patientsToSeed) {
    const doctorId = doctorIds.get(patientData.doctorKey);

    if (doctorId === undefined) {
      throw new Error(`Doctor not found: ${patientData.doctorKey}`);
    }

    const patient = await prisma.patients.upsert({
      where: {
        contact_number: patientData.contact_number,
      },
      create: {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        age: patientData.age,
        gender: patientData.gender,
        diagnosis: patientData.diagnosis,
        contact_number: patientData.contact_number,
        doctor_id: doctorId,
      },
      update: {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        age: patientData.age,
        gender: patientData.gender,
        diagnosis: patientData.diagnosis,
        doctor_id: doctorId,
      },
    });

    patientIds.set(patientData.contact_number, patient.id);
  }

  console.log("Patients seeded successfully.");

  // Create appointments when they do not already exist.
  for (const appointmentData of appointmentsToSeed) {
    const patientId = patientIds.get(appointmentData.patientContact);
    const doctorId = doctorIds.get(appointmentData.doctorKey);

    if (patientId === undefined || doctorId === undefined) {
      throw new Error("Patient or doctor reference not found.");
    }

    const appointmentDate = new Date(appointmentData.appointment_date);

    const existingAppointment = await prisma.appointments.findFirst({
      where: {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        reason: appointmentData.reason,
      },
    });

    if (!existingAppointment) {
      await prisma.appointments.create({
        data: {
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          reason: appointmentData.reason,
          status: appointmentData.status,
        },
      });
    }
  }

  console.log("Appointments seeded successfully.");
  console.log("--------------------------------");
  console.log("Neon database seeding completed!");
  console.log(`Doctors: ${doctorsToSeed.length}`);
  console.log(`Patients: ${patientsToSeed.length}`);
  console.log(`Appointments: ${appointmentsToSeed.length}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
