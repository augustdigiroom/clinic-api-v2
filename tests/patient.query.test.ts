import { describe, expect, it } from "vitest";
import {
  buildPatientWhere,
  buildPatientOrderBy,
} from "../src/queries/patient.query.js";

describe("buildPatientWhere", () => {
  it("should return an empty object when no filters are provided", () => {
    expect(buildPatientWhere({})).toEqual({});
  });

  it("should filter by gender", () => {
    expect(buildPatientWhere({ gender: "Male" })).toEqual({
      gender: "Male",
    });
  });

  it("should filter by minimum age only", () => {
    expect(buildPatientWhere({ minAge: 18 })).toEqual({
      age: {
        gte: 18,
      },
    });
  });

  it("should filter by maximum age only", () => {
    expect(buildPatientWhere({ maxAge: 60 })).toEqual({
      age: {
        lte: 60,
      },
    });
  });

  it("should filter by both minimum and maximum age", () => {
    expect(
      buildPatientWhere({
        minAge: 18,
        maxAge: 60,
      }),
    ).toEqual({
      age: {
        gte: 18,
        lte: 60,
      },
    });
  });

  it("should filter by first name and last name when search is provided", () => {
    expect(buildPatientWhere({ search: "Santos" })).toEqual({
      OR: [
        {
          first_name: {
            contains: "Santos",
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: "Santos",
            mode: "insensitive",
          },
        },
      ],
    });
  });

  it("should ignore an empty search string", () => {
    expect(buildPatientWhere({ search: "" })).toEqual({});
  });

  it("should combine gender, age range, and search filters", () => {
    expect(
      buildPatientWhere({
        gender: "Female",
        minAge: 20,
        maxAge: 40,
        search: "Maria",
      }),
    ).toEqual({
      gender: "Female",
      age: {
        gte: 20,
        lte: 40,
      },
      OR: [
        {
          first_name: {
            contains: "Maria",
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: "Maria",
            mode: "insensitive",
          },
        },
      ],
    });
  });

  it("should allow zero as a minimum age", () => {
    expect(buildPatientWhere({ minAge: 0 })).toEqual({
      age: {
        gte: 0,
      },
    });
  });

  it("should allow zero as a maximum age", () => {
    expect(buildPatientWhere({ maxAge: 0 })).toEqual({
      age: {
        lte: 0,
      },
    });
  });
});

describe("buildPatientOrderBy", () => {
  it("should use id ascending as the default sorting", () => {
    expect(buildPatientOrderBy()).toEqual({
      id: "asc",
    });
  });

  it("should use the supplied sort field and order", () => {
    expect(buildPatientOrderBy("age", "desc")).toEqual({
      age: "desc",
    });
  });

  it.each(["id", "first_name", "last_name", "age", "gender"] as const)(
    "should sort by %s",
    (sortBy) => {
      expect(buildPatientOrderBy(sortBy, "asc")).toEqual({
        [sortBy]: "asc",
      });
    },
  );
});
