import express, { ErrorRequestHandler, NextFunction } from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);

// Global error handler
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Record not found",
      });
    }
  }

  // Generic server error
  console.error(err);
  return res.status(500).json({
    message: "Internal server error",
  });
};

app.use(errorHandler);

export default app;
