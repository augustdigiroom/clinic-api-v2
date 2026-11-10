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

describe("PATCH /api/patients/:id", () => {
  it("should update a patient successfully", async () => {
    // Create a patient for this test
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Patch",
      last_name: "Test Patient",
      age: 25,
      gender: "Male",
    });

    expect(createResponse.status).toBe(201);

    const patientId = createResponse.body.id;

    // Update the patient's information
    const updateResponse = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        age: 30,
        diagnosis: "Updated diagnosis",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.id).toBe(patientId);
    expect(updateResponse.body.age).toBe(30);
    expect(updateResponse.body.diagnosis).toBe("Updated diagnosis");
  });

  it("should update only the provided field and preserve other fields", async () => {
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Partial",
      last_name: "Update Test",
      age: 25,
      gender: "Male",
      diagnosis: "Initial diagnosis",
    });

    expect(createResponse.status).toBe(201);

    const patientId = createResponse.body.id;

    const updateResponse = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        age: 35,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.age).toBe(35);

    // Other fields should remain unchanged
    expect(updateResponse.body.first_name).toBe("Partial");
    expect(updateResponse.body.last_name).toBe("Update Test");
    expect(updateResponse.body.gender).toBe("Male");
    expect(updateResponse.body.diagnosis).toBe("Initial diagnosis");
  });

  it("should reject an invalid age", async () => {
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Invalid",
      last_name: "Age Test",
      age: 25,
    });

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        age: 30.5,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });

  it("should reject an empty first_name", async () => {
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Invalid",
      last_name: "Name Test",
      age: 25,
    });

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        first_name: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });

  it("should reject unknown fields", async () => {
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Unknown",
      last_name: "Field Test",
      age: 25,
    });

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        unknown_field: "Not allowed",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });

  it("should reject an empty update request", async () => {
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Empty",
      last_name: "Update Test",
      age: 25,
    });

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid patient data");
  });

  it("should reject an invalid patient ID", async () => {
    const response = await request(app).patch("/api/patients/abc").send({
      age: 35,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Patient ID must be a positive integer");
  });

  it("should reject a zero patient ID", async () => {
    const response = await request(app).patch("/api/patients/0").send({
      age: 35,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Patient ID must be a positive integer");
  });

  it("should return 404 when patient does not exist", async () => {
    const response = await request(app).patch("/api/patients/999999").send({
      age: 35,
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Patient not found");
  });

  it("should assign an existing doctor to a patient", async () => {
    const doctorsResponse = await request(app).get("/api/doctors");

    expect(doctorsResponse.status).toBe(200);
    expect(doctorsResponse.body.data.length).toBeGreaterThan(0);

    const doctorId = doctorsResponse.body.data[0].id;

    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Assign",
      last_name: "Doctor Test",
      age: 30,
    });

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        doctor_id: doctorId,
      });

    expect(response.status).toBe(200);
    expect(response.body.doctor_id).toBe(doctorId);
  });

  it("should reject a nonexistent doctor ID", async () => {
    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Invalid",
      last_name: "Doctor Test",
      age: 30,
    });

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        doctor_id: 999999,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid doctor_id reference");
  });

  it("should remove an assigned doctor from a patient", async () => {
    const doctorsResponse = await request(app).get("/api/doctors");

    expect(doctorsResponse.body.data.length).toBeGreaterThan(0);

    const doctorId = doctorsResponse.body.data[0].id;

    const createResponse = await request(app).post("/api/patients").send({
      first_name: "Remove",
      last_name: "Doctor Test",
      age: 30,
      doctor_id: doctorId,
    });

    expect(createResponse.status).toBe(201);

    const patientId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/patients/${patientId}`)
      .send({
        doctor_id: null,
      });

    expect(response.status).toBe(200);
    expect(response.body.doctor_id).toBeNull();
  });

  describe("DELETE /api/patients/:id", () => {
    it("should successfully delete an existing patient", async () => {
      const createResponse = await request(app).post("/api/patients").send({
        first_name: "Delete",
        last_name: "Patient Test",
        age: 30,
      });

      expect(createResponse.status).toBe(201);

      const patientId = createResponse.body.id;

      const response = await request(app).delete(`/api/patients/${patientId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(patientId);

      // Verify that the patient was actually deleted.
      const getResponse = await request(app).get(`/api/patients/${patientId}`);

      expect(getResponse.status).toBe(404);
    });

    it("should reject an invalid patient ID", async () => {
      const response = await request(app).delete("/api/patients/abc");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Patient ID must be a positive integer",
      );
    });

    it("should reject a zero patient ID", async () => {
      const response = await request(app).delete("/api/patients/0");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Patient ID must be a positive integer",
      );
    });

    it("should reject a negative patient ID", async () => {
      const response = await request(app).delete("/api/patients/-1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Patient ID must be a positive integer",
      );
    });

    it("should return 404 when patient does not exist", async () => {
      const response = await request(app).delete("/api/patients/999999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Patient not found");
    });
  });
});
