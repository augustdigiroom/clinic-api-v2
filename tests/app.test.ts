import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Clinic API", () => {
  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
  });
});

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
  const response = await request(app).get("/api/patients").query({ limit: 0 });

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
