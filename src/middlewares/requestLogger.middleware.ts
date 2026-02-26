import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "../config/logger.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Middleware that assigns a unique requestId to every incoming request
 * and logs: method, path, status code, duration, authenticated user and IP
 * when the response finishes.
 *
 * Example output:
 *   [a1b2c3d4] POST /auth/login → 200 (31ms) | user:clx... | ip:127.0.0.1
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.requestId = randomUUID().slice(0, 8);
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const userId = req.user?.userId ?? "guest";
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
      req.ip ??
      "unknown";

    const level: "error" | "warn" | "http" =
      status >= 500 ? "error" : status >= 400 ? "warn" : "http";

    logger[level](
      `[${req.requestId}] ${req.method} ${req.path} → ${status} (${duration}ms) | user:${userId} | ip:${ip}`,
    );
  });

  next();
};
