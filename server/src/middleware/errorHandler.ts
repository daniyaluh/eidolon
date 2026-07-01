import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 8 MB)" : "File upload failed";
    return res.status(400).json({ error: message });
  }

  // Errors thrown by the upload fileFilter (e.g. unsupported image type).
  if (err.message.startsWith("Only ")) {
    return res.status(400).json({ error: err.message });
  }

  console.error("[error]", err);
  return res.status(500).json({ error: "Internal server error" });
}
