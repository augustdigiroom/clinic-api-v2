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
