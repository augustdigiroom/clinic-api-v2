import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /api/patients validation", () => {
  it("should reject an invalid gender", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ gender: "Other" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("gender must be Male or Female");
  });

  it("should reject a minimum age greater than the maximum age", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ minAge: 50, maxAge: 20 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("minAge cannot be greater than maxAge");
  });

  it("should reject an unsupported sort field", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ sortBy: "invalidField" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "sortBy must be one of: id, first_name, last_name, age, gender",
    );
  });

  it("should reject an invalid page number", async () => {
    const response = await request(app).get("/api/patients").query({ page: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("page must be a positive integer");
  });

  it("should reject a negative maximum age", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ maxAge: -1 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("maxAge must be a non-negative integer");
  });

  it("should reject an invalid sort order", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ order: "random" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("order must be asc or desc");
  });

  it("should reject a zero limit", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ limit: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("limit must be a positive integer");
  });

  it("should reject a negative minimum age", async () => {
    const response = await request(app)
      .get("/api/patients")
      .query({ minAge: -1 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("minAge must be a non-negative integer");
  });
});

describe("GET /api/patients success", () => {
  it("should return patients with pagination metadata", async () => {
    const response = await request(app).get("/api/patients");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalRecords: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it("should return a patient profile with doctor information", async () => {
    const patientsResponse = await request(app).get("/api/patients");

    expect(patientsResponse.status).toBe(200);
    expect(patientsResponse.body.data.length).toBeGreaterThan(0);

    const patientId = patientsResponse.body.data[0].id;

    const response = await request(app).get(`/api/patients/${patientId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(patientId);
    expect(response.body).toHaveProperty("first_name");
    expect(response.body).toHaveProperty("last_name");
    expect(response.body).toHaveProperty("doctors");
  });
});

describe("GET /api/patients/:id", () => {
  it("should return 404 when patient does not exist", async () => {
    const response = await request(app).get("/api/patients/999999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Patient not found");
  });

  it("should reject an invalid patient ID", async () => {
    const response = await request(app).get("/api/patients/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Patient ID must be a positive integer");
  });
});

describe("POST /api/patients", () => {
  it("should create a patient successfully", async () => {
    const response = await request(app).post("/api/patients").send({
      first_name: "Integration",
      last_name: "Test Patient",
      age: 30,
      gender: "Male",
      diagnosis: "General checkup",
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.first_name).toBe("Integration");
    expect(response.body.last_name).toBe("Test Patient");
    expect(response.body.age).toBe(30);
  });

  it("should reject a request with a missing first_name", async () => {
    const response = await request(app).post("/api/patients").send({
      last_name: "Test Patient",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });

  it("should reject an invalid age", async () => {
    const response = await request(app).post("/api/patients").send({
      first_name: "Integration",
      last_name: "Test Patient",
      age: 30.5,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });

  it("should reject unknown fields", async () => {
    const response = await request(app).post("/api/patients").send({
      first_name: "Integration",
      last_name: "Test Patient",
      unknown_field: "Not allowed",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });
});

it("should create a patient with an existing doctor", async () => {
  // Get an existing doctor from the API
  const doctorsResponse = await request(app).get("/api/doctors");

  expect(doctorsResponse.status).toBe(200);
  expect(doctorsResponse.body.data.length).toBeGreaterThan(0);

  const doctorId = doctorsResponse.body.data[0].id;

  const response = await request(app).post("/api/patients").send({
    first_name: "Doctor",
    last_name: "Assigned Patient",
    age: 35,
    doctor_id: doctorId,
  });

  expect(response.status).toBe(201);
  expect(response.body.doctor_id).toBe(doctorId);
});

it("should create a patient without a doctor", async () => {
  const response = await request(app).post("/api/patients").send({
    first_name: "No",
    last_name: "Assigned Doctor",
    age: 28,
  });

  expect(response.status).toBe(201);
  expect(response.body.doctor_id).toBeNull();
});

it("should reject a patient with a nonexistent doctor ID", async () => {
  const response = await request(app).post("/api/patients").send({
    first_name: "Invalid",
    last_name: "Doctor Reference",
    age: 40,
    doctor_id: 999999,
  });

  expect(response.status).toBe(400);
});
