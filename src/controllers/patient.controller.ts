import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import {
  buildPatientOrderBy,
  buildPatientWhere,
} from "../queries/patient.query.js";

export const getPatients = async (req: Request, res: Response) => {
  try {
    const gender = req.query.gender;
    const minAgeQuery = req.query.minAge;
    const maxAgeQuery = req.query.maxAge;
    const searchQuery = req.query.search;

    // Sorting and pagination query parameters
    const sortByQuery = req.query.sortBy;
    const orderQuery = req.query.order;
    const pageQuery = req.query.page;
    const limitQuery = req.query.limit;

    // Validate gender
    if (
      gender !== undefined &&
      (typeof gender !== "string" || !["Male", "Female"].includes(gender))
    ) {
      return res.status(400).json({
        message: "gender must be Male or Female",
      });
    }

    // Validate search
    if (searchQuery !== undefined && typeof searchQuery !== "string") {
      return res.status(400).json({
        message: "search must be a string",
      });
    }

    const search =
      typeof searchQuery === "string" ? searchQuery.trim() : undefined;

    // Validate minimum and maximum age
    let minAge: number | undefined;
    let maxAge: number | undefined;

    if (minAgeQuery !== undefined) {
      if (typeof minAgeQuery !== "string" || minAgeQuery.trim() === "") {
        return res.status(400).json({
          message: "minAge must be a valid number",
        });
      }

      minAge = Number(minAgeQuery);

      if (!Number.isInteger(minAge) || minAge < 0) {
        return res.status(400).json({
          message: "minAge must be a non-negative integer",
        });
      }
    }

    if (maxAgeQuery !== undefined) {
      if (typeof maxAgeQuery !== "string" || maxAgeQuery.trim() === "") {
        return res.status(400).json({
          message: "maxAge must be a valid number",
        });
      }

      maxAge = Number(maxAgeQuery);

      if (!Number.isInteger(maxAge) || maxAge < 0) {
        return res.status(400).json({
          message: "maxAge must be a non-negative integer",
        });
      }
    }

    // Validate age range
    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      return res.status(400).json({
        message: "minAge cannot be greater than maxAge",
      });
    }

    // Validate sortBy
    const allowedSortFields = [
      "id",
      "first_name",
      "last_name",
      "age",
      "gender",
    ] as const;

    type PatientSortField = (typeof allowedSortFields)[number];

    if (
      sortByQuery !== undefined &&
      (typeof sortByQuery !== "string" ||
        !allowedSortFields.includes(sortByQuery as PatientSortField))
    ) {
      return res.status(400).json({
        message:
          "sortBy must be one of: id, first_name, last_name, age, gender",
      });
    }

    const sortBy: PatientSortField =
      typeof sortByQuery === "string"
        ? (sortByQuery as PatientSortField)
        : "id";

    // Validate order
    if (
      orderQuery !== undefined &&
      (typeof orderQuery !== "string" || !["asc", "desc"].includes(orderQuery))
    ) {
      return res.status(400).json({
        message: "order must be asc or desc",
      });
    }

    const order: "asc" | "desc" =
      typeof orderQuery === "string" ? (orderQuery as "asc" | "desc") : "asc";

    // Validate page
    let page = 1;

    if (pageQuery !== undefined) {
      if (typeof pageQuery !== "string" || pageQuery.trim() === "") {
        return res.status(400).json({
          message: "page must be a positive integer",
        });
      }

      page = Number(pageQuery);

      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          message: "page must be a positive integer",
        });
      }
    }

    // Validate limit
    let limit = 10;

    if (limitQuery !== undefined) {
      if (typeof limitQuery !== "string" || limitQuery.trim() === "") {
        return res.status(400).json({
          message: "limit must be a positive integer",
        });
      }

      limit = Number(limitQuery);

      if (!Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({
          message: "limit must be a positive integer",
        });
      }
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build the shared filters once
    const where = buildPatientWhere({
      gender,
      minAge,
      maxAge,
      search,
    });

    // Fetch patients and count matching records
    const [patients, totalRecords] = await Promise.all([
      prisma.patients.findMany({
        where,
        orderBy: buildPatientOrderBy(sortBy, order),
        skip,
        take: limit,
        include: {
          doctors: true,
        },
      }),

      prisma.patients.count({
        where,
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    // Return patients and pagination metadata
    return res.json({
      data: patients,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const patient = await prisma.patients.findUnique({
      where: {
        id: id,
      },
      include: {
        doctors: true,
      },
    });

    if (patient === null) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await prisma.patients.create({
      data: req.body,
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const patient = await prisma.patients.update({
      where: {
        id: id,
      },
      data: req.body,
    });

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Patient not found",
        });
      }
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const patient = await prisma.patients.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Patient not found",
        });
      }
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
