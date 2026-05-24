import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";
import type { JwtPayload } from "../types";

/**
 * JWT Authentication Middleware.
 * Verifies token from Authorization: Bearer <token> header.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Token tidak ditemukan", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, "Token sudah expired", 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, "Token tidak valid", 401);
      return;
    }
    sendError(res, "Autentikasi gagal", 401);
  }
}
