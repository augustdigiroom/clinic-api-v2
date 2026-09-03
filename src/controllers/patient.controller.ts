import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patients.findMany();

    res.json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
