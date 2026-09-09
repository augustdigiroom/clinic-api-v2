import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointments.findMany({});

    res.json(appointments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const appointment = await prisma.appointments.findUnique({
      where: {
        id: id,
      },
      include: {
        patient: true,
        doctors: true,
      },
    });

    if (appointment === null) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointments.create({
      data: req.body,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const appointment = await prisma.appointments.update({
      where: {
        id: id,
      },
      data: req.body,
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const appointment = await prisma.appointments.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
