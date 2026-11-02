import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, error);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
