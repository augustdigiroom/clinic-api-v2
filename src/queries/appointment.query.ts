import { Prisma } from "../../generated/prisma/client.js";

type AppointmentQueryOptions = {
  status?: string | undefined;
  patientId?: number | undefined;
  doctorId?: number | undefined;
  reason?: string | undefined;
};

export const buildAppointmentWhere = ({
  status,
  patientId,
  doctorId,
  reason,
}: AppointmentQueryOptions): Prisma.appointmentsWhereInput => {
  return {
    ...(status !== undefined && {
      status: {
        equals: status,
        mode: "insensitive",
      },
    }),

    ...(patientId !== undefined && {
      patient_id: patientId,
    }),

    ...(doctorId !== undefined && {
      doctor_id: doctorId,
    }),

    ...(reason && {
      reason: {
        contains: reason,
        mode: "insensitive",
      },
    }),
  };
};

type AppointmentSortField =
  | "id"
  | "appointment_date"
  | "status"
  | "patient_id"
  | "doctor_id";

type SortOrder = "asc" | "desc";

export const buildAppointmentOrderBy = (
  sortBy: AppointmentSortField = "appointment_date",
  order: SortOrder = "asc",
): Prisma.appointmentsOrderByWithRelationInput => {
  return {
    [sortBy]: order,
  };
};
