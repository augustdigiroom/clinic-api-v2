import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "../generated/prisma/client.js";

import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
} from "../src/controllers/appointment.controller.js";

const {
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    appointments: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

const createResponse = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as any;

const createPrismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("Test database error", {
    code,
    clientVersion: "test",
  });

describe("Appointment controller unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAppointments", () => {
    it("should return appointments using default query options", async () => {
      const appointments = [{ id: 1 }, { id: 2 }];

      mockFindMany.mockResolvedValue(appointments);
      mockCount.mockResolvedValue(2);

      const req = { query: {} } as any;
      const res = createResponse();
      const next = vi.fn();

      await getAppointments(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        data: appointments,
        pagination: {
          page: 1,
          limit: 10,
          totalRecords: 2,
          totalPages: 1,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should use supplied query options and trim string filters", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const req = {
        query: {
          status: " SCHEDULED ",
          reason: " Consultation ",
          patientId: "2",
          doctorId: "3",
          sortBy: "status",
          order: "desc",
          page: "2",
          limit: "5",
        },
      } as any;

      const res = createResponse();
      const next = vi.fn();

      await getAppointments(req, res, next);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: {
              equals: "SCHEDULED",
              mode: "insensitive",
            },
            reason: {
              contains: "Consultation",
              mode: "insensitive",
            },
            patient_id: 2,
            doctor_id: 3,
          },
          orderBy: {
            status: "desc",
          },
          skip: 5,
          take: 5,
        }),
      );

      expect(next).not.toHaveBeenCalled();
    });

    it("should reject a non-string status", async () => {
      const req = { query: { status: ["A", "B"] } } as any;
      const res = createResponse();

      await getAppointments(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "status must be a string",
      });
    });

    it("should reject a non-string reason", async () => {
      const req = { query: { reason: ["A", "B"] } } as any;
      const res = createResponse();

      await getAppointments(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "reason must be a string",
      });
    });

    it.each(["abc", "0", "-1", "1.5"])(
      "should reject invalid patientId %s",
      async (patientId) => {
        const req = { query: { patientId } } as any;
        const res = createResponse();

        await getAppointments(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "patientId must be a positive integer",
        });
      },
    );

    it.each(["abc", "0", "-1", "1.5"])(
      "should reject invalid doctorId %s",
      async (doctorId) => {
        const req = { query: { doctorId } } as any;
        const res = createResponse();

        await getAppointments(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "doctorId must be a positive integer",
        });
      },
    );

    it("should reject a non-string sortBy", async () => {
      const req = { query: { sortBy: ["id", "status"] } } as any;
      const res = createResponse();

      await getAppointments(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should reject an unsupported sortBy field", async () => {
      const req = { query: { sortBy: "invalid" } } as any;
      const res = createResponse();

      await getAppointments(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should reject a non-string order", async () => {
      const req = { query: { order: ["asc", "desc"] } } as any;
      const res = createResponse();

      await getAppointments(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should reject an unsupported order", async () => {
      const req = { query: { order: "random" } } as any;
      const res = createResponse();

      await getAppointments(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it.each(["abc", "0", "-1", "1.5"])(
      "should reject invalid page %s",
      async (page) => {
        const req = { query: { page } } as any;
        const res = createResponse();

        await getAppointments(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
      },
    );

    it.each(["abc", "0", "-1", "1.5"])(
      "should reject invalid limit %s",
      async (limit) => {
        const req = { query: { limit } } as any;
        const res = createResponse();

        await getAppointments(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
      },
    );

    it("should pass database errors to next middleware", async () => {
      const databaseError = new Error("Database connection failed");

      mockFindMany.mockRejectedValue(databaseError);
      mockCount.mockResolvedValue(0);

      const req = { query: {} } as any;
      const res = createResponse();
      const next = vi.fn();

      await getAppointments(req, res, next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("getAppointment", () => {
    it("should reject an invalid appointment ID", async () => {
      const req = { params: { id: "abc" } } as any;
      const res = createResponse();

      await getAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should reject a zero appointment ID", async () => {
      const req = { params: { id: "0" } } as any;
      const res = createResponse();

      await getAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when an appointment is not found", async () => {
      mockFindUnique.mockResolvedValue(null);

      const req = { params: { id: "1" } } as any;
      const res = createResponse();

      await getAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Appointment not found",
      });
    });

    it("should return an appointment when found", async () => {
      const appointment = { id: 1, reason: "Consultation" };

      mockFindUnique.mockResolvedValue(appointment);

      const req = { params: { id: "1" } } as any;
      const res = createResponse();

      await getAppointment(req, res, vi.fn());

      expect(res.json).toHaveBeenCalledWith(appointment);
    });

    it("should pass database errors to next middleware", async () => {
      const databaseError = new Error("Database failure");
      mockFindUnique.mockRejectedValue(databaseError);

      const req = { params: { id: "1" } } as any;
      const next = vi.fn();

      await getAppointment(req, createResponse(), next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("createAppointment", () => {
    it("should reject invalid request data", async () => {
      const req = { body: {} } as any;
      const res = createResponse();

      await createAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
        }),
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should create an appointment without doctor_id", async () => {
      const appointment = { id: 1, patient_id: 2 };

      mockCreate.mockResolvedValue(appointment);

      const req = {
        body: {
          patient_id: 2,
          appointment_date: "2026-11-10T09:00:00.000Z",
          reason: "Consultation",
          status: "SCHEDULED",
        },
      } as any;

      const res = createResponse();

      await createAppointment(req, res, vi.fn());

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            doctor_id: expect.anything(),
          }),
        }),
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(appointment);
    });

    it("should create an appointment with a null doctor_id", async () => {
      const appointment = { id: 2, patient_id: 2, doctor_id: null };

      mockCreate.mockResolvedValue(appointment);

      const req = {
        body: {
          patient_id: 2,
          doctor_id: null,
          appointment_date: "2026-11-10T09:00:00.000Z",
          reason: "Consultation",
          status: "SCHEDULED",
        },
      } as any;

      const res = createResponse();

      await createAppointment(req, res, vi.fn());

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            doctor_id: null,
          }),
        }),
      );

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle Prisma foreign key errors", async () => {
      mockCreate.mockRejectedValue(createPrismaError("P2003"));

      const req = {
        body: {
          patient_id: 2,
          appointment_date: "2026-11-10T09:00:00.000Z",
          reason: "Consultation",
          status: "SCHEDULED",
        },
      } as any;

      const res = createResponse();
      const next = vi.fn();

      await createAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid patient_id or doctor_id reference",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass unexpected errors to next middleware", async () => {
      const databaseError = new Error("Unexpected create error");
      mockCreate.mockRejectedValue(databaseError);

      const req = {
        body: {
          patient_id: 2,
          appointment_date: "2026-11-10T09:00:00.000Z",
          reason: "Consultation",
          status: "SCHEDULED",
        },
      } as any;

      const next = vi.fn();

      await createAppointment(req, createResponse(), next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("updateAppointment", () => {
    it("should reject an invalid appointment ID", async () => {
      const req = {
        params: { id: "abc" },
        body: { reason: "Updated consultation" },
      } as any;

      const res = createResponse();

      await updateAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should reject an empty update body", async () => {
      const req = {
        params: { id: "1" },
        body: {},
      } as any;

      const res = createResponse();

      await updateAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should update all supported fields", async () => {
      const appointment = { id: 1, reason: "Updated consultation" };

      mockUpdate.mockResolvedValue(appointment);

      const req = {
        params: { id: "1" },
        body: {
          patient_id: 2,
          doctor_id: null,
          appointment_date: "2026-11-10T10:00:00.000Z",
          reason: "Updated consultation",
          status: "COMPLETED",
        },
      } as any;

      const res = createResponse();

      await updateAppointment(req, res, vi.fn());

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            patient_id: 2,
            doctor_id: null,
            reason: "Updated consultation",
            status: "COMPLETED",
            appointment_date: new Date("2026-11-10T10:00:00.000Z"),
          }),
        }),
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(appointment);
    });

    it("should handle a Prisma P2025 error", async () => {
      mockUpdate.mockRejectedValue(createPrismaError("P2025"));

      const req = {
        params: { id: "1" },
        body: { reason: "Updated consultation" },
      } as any;

      const res = createResponse();

      await updateAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Appointment not found",
      });
    });

    it("should handle a Prisma P2003 error", async () => {
      mockUpdate.mockRejectedValue(createPrismaError("P2003"));

      const req = {
        params: { id: "1" },
        body: { patient_id: 999 },
      } as any;

      const res = createResponse();

      await updateAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid patient_id or doctor_id reference",
      });
    });

    it("should pass unexpected update errors to next middleware", async () => {
      const databaseError = new Error("Unexpected update error");
      mockUpdate.mockRejectedValue(databaseError);

      const req = {
        params: { id: "1" },
        body: { reason: "Updated consultation" },
      } as any;

      const next = vi.fn();

      await updateAppointment(req, createResponse(), next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("deleteAppointment", () => {
    it("should reject an invalid appointment ID", async () => {
      const req = { params: { id: "abc" } } as any;
      const res = createResponse();

      await deleteAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should delete an appointment successfully", async () => {
      const appointment = { id: 1 };

      mockDelete.mockResolvedValue(appointment);

      const req = { params: { id: "1" } } as any;
      const res = createResponse();

      await deleteAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(appointment);
    });

    it("should handle a Prisma P2025 error", async () => {
      mockDelete.mockRejectedValue(createPrismaError("P2025"));

      const req = { params: { id: "1" } } as any;
      const res = createResponse();

      await deleteAppointment(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Appointment not found",
      });
    });

    it("should pass unexpected delete errors to next middleware", async () => {
      const databaseError = new Error("Unexpected delete error");
      mockDelete.mockRejectedValue(databaseError);

      const req = { params: { id: "1" } } as any;
      const next = vi.fn();

      await deleteAppointment(req, createResponse(), next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("getAppointmentsByDoctor", () => {
    it("should return appointments for a doctor", async () => {
      const appointments = [{ id: 1, doctor_id: 2 }];

      mockFindMany.mockResolvedValue(appointments);

      const req = { params: { doctorId: "2" } } as any;
      const res = createResponse();

      await getAppointmentsByDoctor(req, res, vi.fn());

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { doctor_id: 2 },
        include: {
          patient: true,
          doctors: true,
        },
      });

      expect(res.json).toHaveBeenCalledWith(appointments);
    });

    it("should pass database errors to next middleware", async () => {
      const databaseError = new Error("Doctor appointments query failed");
      mockFindMany.mockRejectedValue(databaseError);

      const req = { params: { doctorId: "2" } } as any;
      const next = vi.fn();

      await getAppointmentsByDoctor(req, createResponse(), next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("getAppointmentsByPatient", () => {
    it("should return appointments for a patient", async () => {
      const appointments = [{ id: 1, patient_id: 3 }];

      mockFindMany.mockResolvedValue(appointments);

      const req = { params: { patientId: "3" } } as any;
      const res = createResponse();

      await getAppointmentsByPatient(req, res, vi.fn());

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { patient_id: 3 },
        include: {
          patient: true,
          doctors: true,
        },
      });

      expect(res.json).toHaveBeenCalledWith(appointments);
    });

    it("should pass database errors to next middleware", async () => {
      const databaseError = new Error("Patient appointments query failed");
      mockFindMany.mockRejectedValue(databaseError);

      const req = { params: { patientId: "3" } } as any;
      const next = vi.fn();

      await getAppointmentsByPatient(req, createResponse(), next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });
});
