import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

/**
 * Role-based access control middleware.
 * Must be used AFTER authMiddleware.
 */
export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Autentikasi diperlukan", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, "Akses ditolak. Anda tidak memiliki izin", 403);
      return;
    }

    next();
  };
}
