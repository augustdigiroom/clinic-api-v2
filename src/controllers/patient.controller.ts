import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

// export const getPatients = async (req: Request, res: Response) => {
//   try {
//     const patients = await prisma.patients.findMany({
//       include: {
//         doctors: true,
//       },
//     });

//     res.json(patients);
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// };

export const getPatients = async (req: Request, res: Response) => {
  try {
    const gender = req.query.gender;
    const minAgeQuery = req.query.minAge;
    const maxAgeQuery = req.query.maxAge;

    if (
      gender !== undefined &&
      (typeof gender !== "string" || !["Male", "Female"].includes(gender))
    ) {
      return res.status(400).json({
        message: "gender must be Male or Female",
      });
    }

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

    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      return res.status(400).json({
        message: "minAge cannot be greater than maxAge",
      });
    }

    const patients = await prisma.patients.findMany({
      where: {
        ...(gender !== undefined && { gender }),
        ...((minAge !== undefined || maxAge !== undefined) && {
          age: {
            ...(minAge !== undefined && { gte: minAge }),
            ...(maxAge !== undefined && { lte: maxAge }),
          },
        }),
      },
      include: {
        doctors: true,
      },
    });

    return res.json(patients);
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
