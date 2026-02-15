import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../modules/auth/auth.types.js";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../config/db.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  const decoded = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { tokenVersion: true },
  });

  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    res.status(403).json({ message: "Session expired. Please log in again." });
    return;
  }

  req.user = decoded;
  next();
};
