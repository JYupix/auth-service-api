import express, { ErrorRequestHandler, NextFunction } from "express";
import helmet from "helmet";
import cookiesParser from "cookie-parser";
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

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookiesParser());

// Health check endpoint
app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
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
