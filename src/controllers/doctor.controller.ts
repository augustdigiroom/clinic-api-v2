import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctors.findMany({});

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
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
