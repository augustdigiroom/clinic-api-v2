import type { RequestHandler } from "express";

const readOnlyMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export const apiModeMiddleware: RequestHandler = (req, res, next) => {
  const apiMode = process.env.API_MODE ?? "demo";

  if (apiMode !== "demo" && apiMode !== "portfolio") {
    return res.status(500).json({
      success: false,
      message: "Invalid API_MODE configuration.",
    });
  }

  if (apiMode === "portfolio" && !readOnlyMethods.has(req.method)) {
    return res.status(403).json({
      success: false,
      message: "This portfolio API is read-only.",
    });
  }

  return next();
};
