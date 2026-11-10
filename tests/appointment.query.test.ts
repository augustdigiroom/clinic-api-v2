import { describe, expect, it } from "vitest";
import {
  buildAppointmentOrderBy,
  buildAppointmentWhere,
} from "../src/queries/appointment.query.js";

describe("buildAppointmentWhere", () => {
  it("should return an empty object when no filters are provided", () => {
    expect(buildAppointmentWhere({})).toEqual({});
  });

  it("should filter by status case-insensitively", () => {
    expect(buildAppointmentWhere({ status: "scheduled" })).toEqual({
      status: {
        equals: "scheduled",
        mode: "insensitive",
      },
    });
  });

  it("should filter by patient ID", () => {
    expect(buildAppointmentWhere({ patientId: 1 })).toEqual({
      patient_id: 1,
    });
  });

  it("should filter by doctor ID", () => {
    expect(buildAppointmentWhere({ doctorId: 2 })).toEqual({
      doctor_id: 2,
    });
  });

  it("should filter by reason case-insensitively", () => {
    expect(buildAppointmentWhere({ reason: "follow-up" })).toEqual({
      reason: {
        contains: "follow-up",
        mode: "insensitive",
      },
    });
  });

  it("should combine multiple filters", () => {
    expect(
      buildAppointmentWhere({
        status: "SCHEDULED",
        patientId: 1,
        doctorId: 2,
        reason: "consultation",
      }),
    ).toEqual({
      status: {
        equals: "SCHEDULED",
        mode: "insensitive",
      },
      patient_id: 1,
      doctor_id: 2,
      reason: {
        contains: "consultation",
        mode: "insensitive",
      },
    });
  });

  it("should not include reason when it is an empty string", () => {
    expect(buildAppointmentWhere({ reason: "" })).toEqual({});
  });

  it("should preserve zero-valued IDs if provided", () => {
    expect(buildAppointmentWhere({ patientId: 0, doctorId: 0 })).toEqual({
      patient_id: 0,
      doctor_id: 0,
    });
  });
});

describe("buildAppointmentOrderBy", () => {
  it("should use appointment_date ascending by default", () => {
    expect(buildAppointmentOrderBy()).toEqual({
      appointment_date: "asc",
    });
  });

  it("should use the specified sort field and order", () => {
    expect(buildAppointmentOrderBy("status", "desc")).toEqual({
      status: "desc",
    });
  });

  it.each([
    "id",
    "appointment_date",
    "status",
    "patient_id",
    "doctor_id",
  ] as const)("should sort by %s", (sortBy) => {
    expect(buildAppointmentOrderBy(sortBy, "asc")).toEqual({
      [sortBy]: "asc",
    });
  });
});
