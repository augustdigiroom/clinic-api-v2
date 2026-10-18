import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import {
  buildDoctorOrderBy,
  buildDoctorWhere,
} from "../queries/doctor.query.js";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const specializationQuery = req.query.specialization;
    const searchQuery = req.query.search;
    const sortByQuery = req.query.sortBy;
    const orderQuery = req.query.order;
    const pageQuery = req.query.page;
    const limitQuery = req.query.limit;

    // Validate specialization
    if (
      specializationQuery !== undefined &&
      typeof specializationQuery !== "string"
    ) {
      return res.status(400).json({
        message: "specialization must be a string",
      });
    }

    // Validate search
    if (searchQuery !== undefined && typeof searchQuery !== "string") {
      return res.status(400).json({
        message: "search must be a string",
      });
    }

    // Validate sortBy
    const allowedSortFields = [
      "id",
      "first_name",
      "last_name",
      "specialization",
    ] as const;

    type DoctorSortField = (typeof allowedSortFields)[number];

    if (
      sortByQuery !== undefined &&
      (typeof sortByQuery !== "string" ||
        !allowedSortFields.includes(sortByQuery as DoctorSortField))
    ) {
      return res.status(400).json({
        message:
          "sortBy must be one of: id, first_name, last_name, specialization",
      });
    }

    const sortBy: DoctorSortField =
      typeof sortByQuery === "string" ? (sortByQuery as DoctorSortField) : "id";

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
    if (
      pageQuery !== undefined &&
      (typeof pageQuery !== "string" ||
        !/^\d+$/.test(pageQuery) ||
        Number(pageQuery) < 1)
    ) {
      return res.status(400).json({
        message: "page must be a positive integer",
      });
    }

    // Validate limit
    if (
      limitQuery !== undefined &&
      (typeof limitQuery !== "string" ||
        !/^\d+$/.test(limitQuery) ||
        Number(limitQuery) < 1)
    ) {
      return res.status(400).json({
        message: "limit must be a positive integer",
      });
    }

    // Set pagination defaults
    const page = pageQuery === undefined ? 1 : Number(pageQuery);
    const limit = limitQuery === undefined ? 10 : Number(limitQuery);

    // Calculate records to skip
    const skip = (page - 1) * limit;

    // Normalize search filters
    const specialization =
      typeof specializationQuery === "string"
        ? specializationQuery.trim()
        : undefined;

    const search =
      typeof searchQuery === "string" ? searchQuery.trim() : undefined;

    // Build shared filter conditions
    const where = buildDoctorWhere({
      specialization,
      search,
    });

    // Fetch the current page and total matching records
    const [doctors, totalRecords] = await Promise.all([
      prisma.doctors.findMany({
        where,
        orderBy: buildDoctorOrderBy(sortBy, order),
        skip,
        take: limit,
      }),

      prisma.doctors.count({
        where,
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    return res.json({
      data: doctors,
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

export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const doctors = await prisma.doctors.findUnique({
      where: {
        id: id,
      },
      include: {
        patients: true,
      },
    });

    if (doctors === null) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctors.create({
      data: req.body,
    });

    res.status(201).json(doctors);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const doctors = await prisma.doctors.update({
      where: {
        id: id,
      },
      data: req.body,
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Doctor not found",
        });
      }
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const doctors = await prisma.doctors.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Doctor not found",
        });
      }
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
