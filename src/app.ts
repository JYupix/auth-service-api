import express, { ErrorRequestHandler, NextFunction } from "express";
import helmet from "helmet";
import cookiesParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";
import morgan from "morgan";
import logger, { morganStream } from "./config/logger.js";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import authRoutes from "./modules/auth/auth.routes.js";
import postsRoutes from "./modules/posts/posts.routes.js";
import commentsRoutes from "./modules/comments/comments.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import tagsRoutes from "./modules/tags/tags.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import bookmarksRoutes from "./modules/bookmarks/bookmarks.routes.js";

const app = express();

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookiesParser());
app.use(generalLimiter);
app.use(morgan("dev", { stream: morganStream }));

// Health check endpoint
app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/bookmarks", bookmarksRoutes);

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

  // Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({ message: err.message });
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
  logger.error(err instanceof Error ? err.message : String(err));
  return res.status(500).json({
    message: "Internal server error",
  });
};

app.use(errorHandler);

export default app;
