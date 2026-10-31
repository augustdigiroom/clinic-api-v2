import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Clinic API", () => {
  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
  });
});
