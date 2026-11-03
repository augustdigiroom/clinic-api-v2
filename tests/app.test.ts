import express from "express";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { errorHandler } from "../src/middleware/error.middleware.js";

describe("Clinic API", () => {
  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });

  it("should return 500 for an unexpected error", async () => {
    const testApp = express();

    testApp.get("/test-error", (req, res, next) => {
      next(new Error("Test unexpected error"));
    });

    testApp.use(errorHandler);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(testApp).get("/test-error");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
