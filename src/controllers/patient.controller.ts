import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patients.findMany({
      include: {
        doctors: true,
      },
    });

    res.json(patients);
  } catch (error) {
    res.status(500).json({
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
