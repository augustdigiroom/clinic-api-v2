import { Prisma } from "../../generated/prisma/client.js";

type PatientQueryOptions = {
  gender?: string | undefined;
  minAge?: number | undefined;
  maxAge?: number | undefined;
  search?: string | undefined;
};

export const buildPatientWhere = ({
  gender,
  minAge,
  maxAge,
  search,
}: PatientQueryOptions): Prisma.patientsWhereInput => {
  return {
    ...(gender !== undefined && { gender }),

    ...((minAge !== undefined || maxAge !== undefined) && {
      age: {
        ...(minAge !== undefined && { gte: minAge }),
        ...(maxAge !== undefined && { lte: maxAge }),
      },
    }),

    ...(search && {
      OR: [
        {
          first_name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };
};

//======================================================================

type PatientSortField = "id" | "first_name" | "last_name" | "age" | "gender";

type SortOrder = "asc" | "desc";

export const buildPatientOrderBy = (
  sortBy: PatientSortField = "id",
  order: SortOrder = "asc",
): Prisma.patientsOrderByWithRelationInput => {
  return {
    [sortBy]: order,
  };
};
