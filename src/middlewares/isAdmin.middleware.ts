import { Request, Response, NextFunction } from "express";

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userRole = req.user?.role;

  if (!userRole) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (userRole !== "ADMIN") {
    res.status(403).json({ 
      message: "Forbidden. Admin access required." 
    });
    return;
  }

  next();
};