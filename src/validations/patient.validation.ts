import { z } from "zod";

export const createPatientSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    age: z.number().int().nullable().optional(),
    gender: z.string().max(20).nullable().optional(),
    diagnosis: z.string().nullable().optional(),
    contact_number: z.string().max(30).nullable().optional(),
    doctor_id: z.number().int().positive().nullable().optional(),
  })
  .strict();
