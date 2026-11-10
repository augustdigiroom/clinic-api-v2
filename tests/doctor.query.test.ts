import { describe, expect, it } from "vitest";
import {
  buildDoctorWhere,
  buildDoctorOrderBy,
} from "../src/queries/doctor.query.js";

describe("buildDoctorWhere", () => {
  it("should return an empty object when no filters are provided", () => {
    expect(buildDoctorWhere({})).toEqual({});
  });

  it("should filter by specialization", () => {
    expect(buildDoctorWhere({ specialization: "Cardiology" })).toEqual({
      specialization: {
        equals: "Cardiology",
        mode: "insensitive",
      },
    });
  });

  it("should allow an empty specialization string", () => {
    expect(buildDoctorWhere({ specialization: "" })).toEqual({
      specialization: {
        equals: "",
        mode: "insensitive",
      },
    });
  });

  it("should search by first name and last name", () => {
    expect(buildDoctorWhere({ search: "Garcia" })).toEqual({
      OR: [
        {
          first_name: {
            contains: "Garcia",
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: "Garcia",
            mode: "insensitive",
          },
        },
      ],
    });
  });

  it("should ignore an empty search string", () => {
    expect(buildDoctorWhere({ search: "" })).toEqual({});
  });

  it("should combine specialization and search filters", () => {
    expect(
      buildDoctorWhere({
        specialization: "Neurology",
        search: "Miguel",
      }),
    ).toEqual({
      specialization: {
        equals: "Neurology",
        mode: "insensitive",
      },
      OR: [
        {
          first_name: {
            contains: "Miguel",
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: "Miguel",
            mode: "insensitive",
          },
        },
      ],
    });
  });
});

describe("buildDoctorOrderBy", () => {
  it("should use id ascending as the default sorting", () => {
    expect(buildDoctorOrderBy()).toEqual({
      id: "asc",
    });
  });

  it("should use the supplied sort field and order", () => {
    expect(buildDoctorOrderBy("specialization", "desc")).toEqual({
      specialization: "desc",
    });
  });

  it.each(["id", "first_name", "last_name", "specialization"] as const)(
    "should sort by %s",
    (sortBy) => {
      expect(buildDoctorOrderBy(sortBy, "asc")).toEqual({
        [sortBy]: "asc",
      });
    },
  );
});
