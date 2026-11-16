export type DemoDoctor = {
  key: string;
  first_name: string;
  last_name: string;
  specialization: string;
};

export type DemoPatient = {
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  diagnosis: string;
  contact_number: string;
  doctorKey: string;
};

export type DemoAppointment = {
  patientContact: string;
  doctorKey: string;
  appointment_date: string;
  reason: string;
  status: string;
};

// ========================================
// 1. FICTIONAL DOCTORS
// ========================================

export const doctorsToSeed: DemoDoctor[] = [
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
// 2. FICTIONAL PATIENTS
// ========================================

export const patientsToSeed: DemoPatient[] = [
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
// 3. FICTIONAL APPOINTMENTS
// ========================================

export const appointmentsToSeed: DemoAppointment[] = [
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
