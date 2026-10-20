import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import { z } from "zod";
import {
  buildAppointmentOrderBy,
  buildAppointmentWhere,
} from "../queries/appointment.query.js";

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const statusQuery = req.query.status;
    const patientIdQuery = req.query.patientId;
    const doctorIdQuery = req.query.doctorId;
    const reasonQuery = req.query.reason;
    const sortByQuery = req.query.sortBy;
    const orderQuery = req.query.order;
    const pageQuery = req.query.page;
    const limitQuery = req.query.limit;

    // Validate status
    if (statusQuery !== undefined && typeof statusQuery !== "string") {
      return res.status(400).json({
        message: "status must be a string",
      });
    }

    // Validate reason
    if (reasonQuery !== undefined && typeof reasonQuery !== "string") {
      return res.status(400).json({
        message: "reason must be a string",
      });
    }

    // Validate patientId
    if (
      patientIdQuery !== undefined &&
      (typeof patientIdQuery !== "string" ||
        !/^\d+$/.test(patientIdQuery) ||
        Number(patientIdQuery) < 1)
    ) {
      return res.status(400).json({
        message: "patientId must be a positive integer",
      });
    }

    // Validate doctorId
    if (
      doctorIdQuery !== undefined &&
      (typeof doctorIdQuery !== "string" ||
        !/^\d+$/.test(doctorIdQuery) ||
        Number(doctorIdQuery) < 1)
    ) {
      return res.status(400).json({
        message: "doctorId must be a positive integer",
      });
    }

    // Validate sortBy
    const allowedSortFields = [
      "id",
      "appointment_date",
      "status",
      "patient_id",
      "doctor_id",
    ] as const;

    type AppointmentSortField = (typeof allowedSortFields)[number];

    if (
      sortByQuery !== undefined &&
      (typeof sortByQuery !== "string" ||
        !allowedSortFields.includes(sortByQuery as AppointmentSortField))
    ) {
      return res.status(400).json({
        message:
          "sortBy must be one of: id, appointment_date, status, patient_id, doctor_id",
      });
    }

    const sortBy: AppointmentSortField =
      typeof sortByQuery === "string"
        ? (sortByQuery as AppointmentSortField)
        : "appointment_date";

    // Validate order
    if (
      orderQuery !== undefined &&
      (typeof orderQuery !== "string" || !["asc", "desc"].includes(orderQuery))
    ) {
      return res.status(400).json({
        message: "order must be asc or desc",
      });
    }

    const order: "asc" | "desc" =
      typeof orderQuery === "string" ? (orderQuery as "asc" | "desc") : "asc";

    // Validate page
    if (
      pageQuery !== undefined &&
      (typeof pageQuery !== "string" ||
        !/^\d+$/.test(pageQuery) ||
        Number(pageQuery) < 1)
    ) {
      return res.status(400).json({
        message: "page must be a positive integer",
      });
    }

    // Validate limit
    if (
      limitQuery !== undefined &&
      (typeof limitQuery !== "string" ||
        !/^\d+$/.test(limitQuery) ||
        Number(limitQuery) < 1)
    ) {
      return res.status(400).json({
        message: "limit must be a positive integer",
      });
    }

    const status =
      typeof statusQuery === "string" ? statusQuery.trim() : undefined;

    const reason =
      typeof reasonQuery === "string" ? reasonQuery.trim() : undefined;

    const patientId =
      typeof patientIdQuery === "string" ? Number(patientIdQuery) : undefined;

    const doctorId =
      typeof doctorIdQuery === "string" ? Number(doctorIdQuery) : undefined;

    const page = pageQuery === undefined ? 1 : Number(pageQuery);
    const limit = limitQuery === undefined ? 10 : Number(limitQuery);
    const skip = (page - 1) * limit;

    const where = buildAppointmentWhere({
      status,
      patientId,
      doctorId,
      reason,
    });

    const [appointments, totalRecords] = await Promise.all([
      prisma.appointments.findMany({
        where,
        orderBy: buildAppointmentOrderBy(sortBy, order),
        skip,
        take: limit,
        include: {
          patient: true,
          doctors: true,
        },
      }),

      prisma.appointments.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return res.json({
      data: appointments,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Validate appointment ID
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Appointment ID must be a positive integer",
      });
    }

    const appointment = await prisma.appointments.findUnique({
      where: {
        id: id,
      },
      include: {
        patient: true,
        doctors: true,
      },
    });

    if (appointment === null) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    return res.json(appointment);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentSchema = z
      .object({
        patient_id: z.number().int().positive(),

        doctor_id: z.number().int().positive().nullable().optional(),

        appointment_date: z
          .string()
          .refine(
            (value) =>
              value.trim().length > 0 && !Number.isNaN(Date.parse(value)),
            {
              message: "appointment_date must be a valid date",
            },
          ),

        reason: z.string().trim().min(1).max(100),

        status: z.string().trim().min(1).max(20),
      })
      .strict();

    const validation = appointmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { patient_id, doctor_id, appointment_date, reason, status } =
      validation.data;

    const appointment = await prisma.appointments.create({
      data: {
        patient_id,
        ...(doctor_id !== undefined ? { doctor_id } : {}),
        appointment_date: new Date(appointment_date),
        reason,
        status,
      },
      include: {
        patient: true,
        doctors: true,
      },
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(400).json({
          message: "Invalid patient_id or doctor_id reference",
        });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Validate appointment ID
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Appointment ID must be a positive integer",
      });
    }

    // Validate request body
    const updateAppointmentSchema = z
      .object({
        patient_id: z.number().int().positive().optional(),

        doctor_id: z.number().int().positive().nullable().optional(),

        appointment_date: z
          .string()
          .refine(
            (value) =>
              value.trim().length > 0 && !Number.isNaN(Date.parse(value)),
            {
              message: "appointment_date must be a valid date",
            },
          )
          .optional(),

        reason: z.string().trim().min(1).max(100).optional(),

        status: z.string().trim().min(1).max(20).optional(),
      })
      .strict()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
      });

    const validation = updateAppointmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { patient_id, doctor_id, appointment_date, reason, status } =
      validation.data;

    const appointment = await prisma.appointments.update({
      where: { id },
      data: {
        ...(patient_id !== undefined ? { patient_id } : {}),
        ...(doctor_id !== undefined ? { doctor_id } : {}),
        ...(appointment_date !== undefined
          ? { appointment_date: new Date(appointment_date) }
          : {}),
        ...(reason !== undefined ? { reason } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: {
        patient: true,
        doctors: true,
      },
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          message: "Invalid patient_id or doctor_id reference",
        });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Validate appointment ID
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Appointment ID must be a positive integer",
      });
    }

    const appointment = await prisma.appointments.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAppointmentsByDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = Number(req.params.doctorId);

    const appointments = await prisma.appointments.findMany({
      where: {
        doctor_id: doctorId,
      },
      include: {
        patient: true,
        doctors: true,
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAppointmentsByPatient = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);

    const appointments = await prisma.appointments.findMany({
      where: {
        patient_id: patientId,
      },
      include: {
        patient: true,
        doctors: true,
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
