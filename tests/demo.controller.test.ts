import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  transaction: vi.fn(),
  appointmentDeleteMany: vi.fn(),
  patientDeleteMany: vi.fn(),
  doctorDeleteMany: vi.fn(),
  doctorCreate: vi.fn(),
  patientCreate: vi.fn(),
  appointmentCreate: vi.fn(),
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
    $transaction: mocks.transaction,
  },
}));

const transactionClient = {
  appointments: {
    deleteMany: mocks.appointmentDeleteMany,
    create: mocks.appointmentCreate,
  },
  patients: {
    deleteMany: mocks.patientDeleteMany,
    create: mocks.patientCreate,
  },
  doctors: {
    deleteMany: mocks.doctorDeleteMany,
    create: mocks.doctorCreate,
  },
};

describe("POST /api/demo/reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.API_MODE = "demo";

    process.env.DATABASE_URL =
      "postgresql://clinic_demo_app:test@ep-example.neon.tech/neondb";

    mocks.queryRaw.mockResolvedValue([
      {
        current_user: "clinic_demo_app",
        current_database: "neondb",
      },
    ]);

    mocks.appointmentDeleteMany.mockResolvedValue({ count: 0 });
    mocks.patientDeleteMany.mockResolvedValue({ count: 0 });
    mocks.doctorDeleteMany.mockResolvedValue({ count: 0 });

    let doctorId = 1;
    let patientId = 1;

    mocks.doctorCreate.mockImplementation(async ({ data }) => ({
      id: doctorId++,
      ...data,
    }));

    mocks.patientCreate.mockImplementation(async ({ data }) => ({
      id: patientId++,
      ...data,
    }));

    mocks.appointmentCreate.mockResolvedValue({ id: 1 });

    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(transactionClient),
    );
  });

  it("should reject reset when API mode is portfolio", async () => {
    process.env.API_MODE = "portfolio";

    const response = await request(app).post("/api/demo/reset");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("This portfolio API is read-only.");

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("should reject an unauthorized database role", async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        current_user: "neondb_owner",
        current_database: "neondb",
      },
    ]);

    const response = await request(app).post("/api/demo/reset");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Database identity is not authorized for Demo reset.",
    );

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("should reject non-Neon database connections", async () => {
    process.env.DATABASE_URL =
      "postgresql://postgres:test@localhost:5432/clinic_postgres";

    const response = await request(app).post("/api/demo/reset");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Reset is only allowed on the Neon Demo database.",
    );

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("should restore Demo records and enforce cooldown", async () => {
    const response = await request(app).post("/api/demo/reset");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Demo data reset successfully.",
      data: {
        doctors: 4,
        patients: 8,
        appointments: 8,
      },
    });

    expect(mocks.appointmentDeleteMany).toHaveBeenCalledOnce();
    expect(mocks.patientDeleteMany).toHaveBeenCalledOnce();
    expect(mocks.doctorDeleteMany).toHaveBeenCalledOnce();

    expect(mocks.doctorCreate).toHaveBeenCalledTimes(4);
    expect(mocks.patientCreate).toHaveBeenCalledTimes(8);
    expect(mocks.appointmentCreate).toHaveBeenCalledTimes(8);

    const secondResponse = await request(app).post("/api/demo/reset");

    expect(secondResponse.status).toBe(429);
    expect(secondResponse.body.message).toBe(
      "Please wait before resetting Demo data again.",
    );
  });
});
