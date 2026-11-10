import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDoctors,
  getDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../src/controllers/doctor.controller.js";

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
    doctors: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

describe("Doctor controller error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass database errors to next middleware when fetching doctors fails", async () => {
    const databaseError = new Error("Database connection failed");
    mockFindMany.mockRejectedValue(databaseError);
    mockCount.mockResolvedValue(0);

    const req = { query: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await getDoctors(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should pass database errors to next middleware when fetching a doctor profile fails", async () => {
    const databaseError = new Error("Database connection failed");
    mockFindUnique.mockRejectedValue(databaseError);

    const req = { params: { id: "2" } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await getDoctorProfile(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should pass database errors to next middleware when creating a doctor fails", async () => {
    const databaseError = new Error("Database connection failed");
    mockCreate.mockRejectedValue(databaseError);

    const req = {
      body: {
        first_name: "Test",
        last_name: "Doctor",
        specialization: "Cardiology",
      },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await createDoctor(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should pass unexpected database errors to next middleware when updating a doctor fails", async () => {
    const databaseError = new Error("Unexpected database failure");
    mockUpdate.mockRejectedValue(databaseError);

    const req = {
      params: { id: "2" },
      body: { specialization: "Cardiology" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await updateDoctor(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should pass unexpected database errors to next middleware when deleting a doctor fails", async () => {
    const databaseError = new Error("Unexpected database failure");
    mockDelete.mockRejectedValue(databaseError);

    const req = { params: { id: "2" } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await deleteDoctor(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
