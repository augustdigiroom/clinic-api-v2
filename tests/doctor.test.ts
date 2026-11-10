import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

// Track doctors created during tests
const createdDoctorIds: number[] = [];

// Automatically clean up test doctors after each test
afterEach(async () => {
  const ids = createdDoctorIds.splice(0);

  for (const id of ids) {
    await request(app).delete(`/api/doctors/${id}`);
  }
});

// Helper to create a temporary doctor
const createTestDoctor = async () => {
  const response = await request(app).post("/api/doctors").send({
    first_name: "Temporary",
    last_name: "TestDoctor",
    specialization: "Test Specialization",
  });

  expect(response.status).toBe(201);

  const doctorId = response.body.id as number;

  createdDoctorIds.push(doctorId);

  return doctorId;
};

describe("GET /api/doctors validation", () => {
  it("should reject a non-string specialization", async () => {
    const response = await request(app)
      .get("/api/doctors")
      .query({ specialization: ["Cardiology", "Neurology"] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("specialization must be a string");
  });

  it("should reject a non-string search value", async () => {
    const response = await request(app)
      .get("/api/doctors")
      .query({ search: ["Maria", "Juan"] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("search must be a string");
  });

  it("should reject an unsupported sort field", async () => {
    const response = await request(app)
      .get("/api/doctors")
      .query({ sortBy: "invalidField" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "sortBy must be one of: id, first_name, last_name, specialization",
    );
  });

  it("should reject an invalid sort order", async () => {
    const response = await request(app)
      .get("/api/doctors")
      .query({ order: "random" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("order must be asc or desc");
  });

  it("should reject an invalid page number", async () => {
    const response = await request(app).get("/api/doctors").query({ page: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("page must be a positive integer");
  });

  it("should reject a zero limit", async () => {
    const response = await request(app).get("/api/doctors").query({ limit: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("limit must be a positive integer");
  });
});

describe("GET /api/doctors success", () => {
  it("should return all doctors with pagination metadata", async () => {
    const response = await request(app).get("/api/doctors");

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);

    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalRecords: expect.any(Number),
      totalPages: expect.any(Number),
    });

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should return a doctor profile with associated patients", async () => {
    const response = await request(app).get("/api/doctors/2");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 2,
      first_name: "Elena",
      last_name: "Reyes",
      specialization: "Endocrinology",
    });

    expect(response.body.patients).toBeInstanceOf(Array);
  });

  it("should return 404 when doctor does not exist", async () => {
    const response = await request(app).get("/api/doctors/99999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Doctor not found");
  });
});

describe("POST /api/doctors", () => {
  it("should create a doctor successfully", async () => {
    const newDoctor = {
      first_name: "Test",
      last_name: "Doctor",
      specialization: "Cardiology",
    };

    const response = await request(app).post("/api/doctors").send(newDoctor);

    expect(response.status).toBe(201);

    // Register the created doctor for automatic cleanup
    if (typeof response.body.id === "number") {
      createdDoctorIds.push(response.body.id);
    }

    expect(response.body).toMatchObject(newDoctor);
    expect(response.body.id).toEqual(expect.any(Number));
  });
});

describe("PATCH /api/doctors/:id", () => {
  it("should update a doctor successfully", async () => {
    const doctorId = await createTestDoctor();

    const updatedDoctor = {
      specialization: "Cardiology and Internal Medicine",
    };

    const response = await request(app)
      .patch(`/api/doctors/${doctorId}`)
      .send(updatedDoctor);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: doctorId,
      first_name: "Temporary",
      last_name: "TestDoctor",
      specialization: "Cardiology and Internal Medicine",
    });
  });

  it("should return 404 when doctor does not exist", async () => {
    const response = await request(app).patch("/api/doctors/99999").send({
      specialization: "Cardiology",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Doctor not found");
  });
});

describe("DELETE /api/doctors/:id", () => {
  it("should delete a doctor successfully", async () => {
    const doctorId = await createTestDoctor();

    const deleteResponse = await request(app).delete(
      `/api/doctors/${doctorId}`,
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.id).toBe(doctorId);

    const getResponse = await request(app).get(`/api/doctors/${doctorId}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.message).toBe("Doctor not found");
  });

  it("should return 404 when doctor does not exist", async () => {
    const response = await request(app).delete("/api/doctors/99999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Doctor not found");
  });
});
