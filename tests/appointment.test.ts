import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /api/appointments validation", () => {
  it("should reject a non-string status", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ status: ["SCHEDULED", "CANCELLED"] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("status must be a string");
  });

  it("should reject a non-string reason", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ reason: ["Consultation", "Follow-up"] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("reason must be a string");
  });

  it("should reject an invalid patient ID", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ patientId: "abc" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("patientId must be a positive integer");
  });

  it("should reject an invalid doctor ID", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ doctorId: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("doctorId must be a positive integer");
  });

  it("should reject an unsupported sort field", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ sortBy: "invalidField" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "sortBy must be one of: id, appointment_date, status, patient_id, doctor_id",
    );
  });

  it("should reject an invalid sort order", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ order: "random" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("order must be asc or desc");
  });

  it("should reject an invalid page number", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ page: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("page must be a positive integer");
  });

  it("should reject a zero limit", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .query({ limit: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("limit must be a positive integer");
  });
});

describe("GET /api/appointments/:id", () => {
  it("should reject an invalid appointment ID", async () => {
    const response = await request(app).get("/api/appointments/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Appointment ID must be a positive integer",
    );
  });

  it("should return 404 when appointment does not exist", async () => {
    const response = await request(app).get("/api/appointments/999999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Appointment not found");
  });
});

describe("POST /api/appointments validation", () => {
  it("should reject a missing patient_id", async () => {
    const response = await request(app).post("/api/appointments").send({
      reason: "Initial consultation",
      status: "SCHEDULED",
      appointment_date: "2026-11-01T09:00:00.000Z",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("should reject an invalid doctor_id", async () => {
    const response = await request(app).post("/api/appointments").send({
      patient_id: 2,
      doctor_id: -1,
      reason: "Initial consultation",
      status: "SCHEDULED",
      appointment_date: "2026-11-01T09:00:00.000Z",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("should reject an unknown field", async () => {
    const response = await request(app).post("/api/appointments").send({
      patient_id: 2,
      reason: "Initial consultation",
      status: "SCHEDULED",
      appointment_date: "2026-11-01T09:00:00.000Z",
      unknownField: "test",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });
});

it("should reject an invalid appointment_date", async () => {
  const response = await request(app).post("/api/appointments").send({
    patient_id: 2,
    reason: "Initial consultation",
    status: "SCHEDULED",
    appointment_date: "invalid-date",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
});

it("should reject an empty reason", async () => {
  const response = await request(app).post("/api/appointments").send({
    patient_id: 2,
    reason: "   ",
    status: "SCHEDULED",
    appointment_date: "2026-11-01T09:00:00.000Z",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
});

it("should reject a reason longer than 100 characters", async () => {
  const response = await request(app)
    .post("/api/appointments")
    .send({
      patient_id: 2,
      reason: "A".repeat(101),
      status: "SCHEDULED",
      appointment_date: "2026-11-01T09:00:00.000Z",
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
});

it("should reject a missing status", async () => {
  const response = await request(app).post("/api/appointments").send({
    patient_id: 2,
    reason: "Initial consultation",
    appointment_date: "2026-11-01T09:00:00.000Z",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
});

describe("POST /api/appointments success", () => {
  it("should create a new appointment successfully", async () => {
    const response = await request(app).post("/api/appointments").send({
      patient_id: 1,
      doctor_id: null,
      appointment_date: "2026-11-01T09:00:00.000Z",
      reason: "Automated API testing",
      status: "SCHEDULED",
    });

    expect(response.status).toBe(201);
    expect(response.body.patient_id).toBe(1);
    expect(response.body.doctor_id).toBeNull();
    expect(response.body.reason).toBe("Automated API testing");
    expect(response.body.status).toBe("SCHEDULED");
  });
});

describe("PATCH /api/appointments/:id", () => {
  it("should update an appointment successfully", async () => {
    const response = await request(app).patch("/api/appointments/10").send({
      reason: "Updated automated API testing",
    });

    expect(response.status).toBe(200);
    expect(response.body.reason).toBe("Updated automated API testing");
  });
});

it("should reject an invalid appointment ID", async () => {
  const response = await request(app).patch("/api/appointments/abc").send({
    reason: "Updated consultation",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe(
    "Appointment ID must be a positive integer",
  );
});

it("should reject an empty update body", async () => {
  const response = await request(app).patch("/api/appointments/10").send({});

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
});

it("should return 404 for a nonexistent appointment", async () => {
  const response = await request(app).patch("/api/appointments/999999").send({
    reason: "Updated consultation",
  });

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Appointment not found");
});

describe("DELETE /api/appointments/:id", () => {
  it("should reject an invalid appointment ID", async () => {
    const response = await request(app).delete("/api/appointments/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Appointment ID must be a positive integer",
    );
  });

  it("should return 404 for a nonexistent appointment", async () => {
    const response = await request(app).delete("/api/appointments/999999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Appointment not found");
  });
});

it("should delete an appointment successfully", async () => {
  const createdAppointment = await request(app).post("/api/appointments").send({
    patient_id: 1,
    doctor_id: null,
    appointment_date: "2026-11-02T09:00:00.000Z",
    reason: "Temporary deletion test",
    status: "SCHEDULED",
  });

  expect(createdAppointment.status).toBe(201);

  const appointmentId = createdAppointment.body.id;

  const response = await request(app).delete(
    `/api/appointments/${appointmentId}`,
  );

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("id", appointmentId);
});
