import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

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
