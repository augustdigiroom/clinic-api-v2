import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

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
      "Your current DATABASE_URL does not point to Neon. " +
      "No records were added.",
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ========================================
// 2. FICTIONAL DOCTOR RECORDS
// ========================================

const doctorsToSeed = [
  {
    key: "Maria Santos",
    first_name: "Maria",
    last_name: "Santos",
    specialization: "Cardiology",
  },
  {
    key: "James Reyes",
    first_name: "James",
    last_name: "Reyes",
    specialization: "Pediatrics",
  },
  {
    key: "Angela Cruz",
    first_name: "Angela",
    last_name: "Cruz",
    specialization: "Dermatology",
  },
  {
    key: "Daniel Garcia",
    first_name: "Daniel",
    last_name: "Garcia",
    specialization: "General Medicine",
  },
];

// ========================================
// 3. FICTIONAL PATIENT RECORDS
// ========================================

const patientsToSeed = [
  {
    first_name: "Sofia",
    last_name: "Ramirez",
    age: 29,
    gender: "Female",
    diagnosis: "Seasonal allergies",
    contact_number: "000-000-0001",
    doctorKey: "Maria Santos",
  },
  {
    first_name: "Liam",
    last_name: "Torres",
    age: 8,
    gender: "Male",
    diagnosis: "Annual wellness visit",
    contact_number: "000-000-0002",
    doctorKey: "James Reyes",
  },
  {
    first_name: "Isabella",
    last_name: "Flores",
    age: 42,
    gender: "Female",
    diagnosis: "Hypertension follow-up",
    contact_number: "000-000-0003",
    doctorKey: "Daniel Garcia",
  },
  {
    first_name: "Noah",
    last_name: "Mendoza",
    age: 35,
    gender: "Male",
    diagnosis: "Skin irritation",
    contact_number: "000-000-0004",
    doctorKey: "Angela Cruz",
  },
  {
    first_name: "Ava",
    last_name: "Castillo",
    age: 54,
    gender: "Female",
    diagnosis: "Cholesterol follow-up",
    contact_number: "000-000-0005",
    doctorKey: "Maria Santos",
  },
  {
    first_name: "Ethan",
    last_name: "Navarro",
    age: 16,
    gender: "Male",
    diagnosis: "Sports physical",
    contact_number: "000-000-0006",
    doctorKey: "James Reyes",
  },
  {
    first_name: "Mia",
    last_name: "Dela Cruz",
    age: 23,
    gender: "Female",
    diagnosis: "Eczema follow-up",
    contact_number: "000-000-0007",
    doctorKey: "Angela Cruz",
  },
  {
    first_name: "Lucas",
    last_name: "Villanueva",
    age: 61,
    gender: "Male",
    diagnosis: "General wellness check",
    contact_number: "000-000-0008",
    doctorKey: "Daniel Garcia",
  },
];

// ========================================
// 4. FICTIONAL APPOINTMENT RECORDS
// ========================================

const appointmentsToSeed = [
  {
    patientContact: "000-000-0001",
    doctorKey: "Maria Santos",
    appointment_date: "2026-11-16T09:00:00.000Z",
    reason: "Cardiology follow-up",
    status: "Scheduled",
  },
  {
    patientContact: "000-000-0002",
    doctorKey: "James Reyes",
    appointment_date: "2026-11-16T10:30:00.000Z",
    reason: "Child wellness consultation",
    status: "Confirmed",
  },
  {
    patientContact: "000-000-0003",
    doctorKey: "Daniel Garcia",
    appointment_date: "2026-11-17T13:00:00.000Z",
    reason: "Blood pressure follow-up",
    status: "Scheduled",
  },
  {
    patientContact: "000-000-0004",
    doctorKey: "Angela Cruz",
    appointment_date: "2026-11-17T14:30:00.000Z",
    reason: "Skin assessment",
    status: "Confirmed",
  },
  {
    patientContact: "000-000-0005",
    doctorKey: "Maria Santos",
    appointment_date: "2026-11-18T09:30:00.000Z",
    reason: "Cholesterol consultation",
    status: "Scheduled",
  },
  {
    patientContact: "000-000-0006",
    doctorKey: "James Reyes",
    appointment_date: "2026-11-18T11:00:00.000Z",
    reason: "Sports physical examination",
    status: "Scheduled",
  },
  {
    patientContact: "000-000-0007",
    doctorKey: "Angela Cruz",
    appointment_date: "2026-11-19T10:00:00.000Z",
    reason: "Eczema follow-up",
    status: "Confirmed",
  },
  {
    patientContact: "000-000-0008",
    doctorKey: "Daniel Garcia",
    appointment_date: "2026-11-19T15:00:00.000Z",
    reason: "General medical consultation",
    status: "Scheduled",
  },
];

// ========================================
// 5. SEED DATABASE
// ========================================

async function main() {
  console.log("Starting Neon database seeding...");

  const doctorIds = new Map<string, number>();

  // Create doctors first.
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

  // Create patients and connect them to doctors.
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

  // Create appointments and connect them to patients and doctors.
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
  console.log("Doctors: 4");
  console.log("Patients: 8");
  console.log("Appointments: 8");
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
