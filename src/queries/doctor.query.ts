import { Prisma } from "../../generated/prisma/client.js";

type DoctorQueryOptions = {
  specialization?: string | undefined;
  search?: string | undefined;
};

export const buildDoctorWhere = ({
  specialization,
  search,
}: DoctorQueryOptions): Prisma.doctorsWhereInput => {
  return {
    ...(specialization !== undefined && {
      specialization: {
        equals: specialization,
        mode: "insensitive",
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

type DoctorSortField = "id" | "first_name" | "last_name" | "specialization";

type SortOrder = "asc" | "desc";

export const buildDoctorOrderBy = (
  sortBy: DoctorSortField = "id",
  order: SortOrder = "asc",
): Prisma.doctorsOrderByWithRelationInput => {
  return {
    [sortBy]: order,
  };
};
