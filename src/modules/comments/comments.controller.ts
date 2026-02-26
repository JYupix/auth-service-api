import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { createCommentSchema, updateCommentSchema } from "./comments.schema.js";
import { logAction } from "../../config/logger.js";

export const getCommentsByPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const post = await prisma.post.findUnique({
    where: { id, published: true, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const [comments, totalComments] = await Promise.all([
    prisma.comment.findMany({
      where: { postId: id, deletedAt: null },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.comment.count({
      where: { postId: id, deletedAt: null },
    }),
  ]);

  logAction("comments.list", { postId: id, page, limit });
  res.status(200).json({
    comments,
    pagination: {
      page,
      limit,
      total: totalComments,
      totalPages: Math.ceil(totalComments / limit),
      hasMore: skip + limit < totalComments,
    },
  });
};

export const addCommentToPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id as string;
  const { content } = createCommentSchema.parse(req.body);
  const authorId = req.user?.userId as string;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id, published: true, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId: id,
      authorId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  logAction("comment.create", { commentId: comment.id, postId: id, authorId });
  res.status(201).json({ comment });
};

export const getMyComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorId = req.user?.userId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const [comments, totalMyComments] = await Promise.all([
    prisma.comment.findMany({
      where: { authorId, deletedAt: null },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.comment.count({
      where: { authorId, deletedAt: null },
    }),
  ]);

  logAction("comments.my_comments", { authorId, page, limit });
  res.status(200).json({
    comments,
    pagination: {
      page,
      limit,
      total: totalMyComments,
      totalPages: Math.ceil(totalMyComments / limit),
      hasMore: skip + limit < totalMyComments,
    },
  });
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;
  const { content } = updateCommentSchema.parse(req.body);
  const authorId = req.user?.userId as string;
  const userRole = req.user?.role;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const comment = await prisma.comment.findUnique({
    where: { id, deletedAt: null },
  });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  const isAdmin = userRole === "ADMIN";
  const isAuthor = comment.authorId === authorId;

  if (!isAuthor && !isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  logAction("comment.update", { commentId: id, authorId });
  res.status(200).json({ comment: updatedComment });
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;
  const authorId = req.user?.userId as string;
  const userRole = req.user?.role;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const comment = await prisma.comment.findUnique({
    where: { id, deletedAt: null },
  });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  const isAdmin = userRole === "ADMIN";
  const isAuthor = comment.authorId === authorId;

  if (!isAuthor && !isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  logAction("comment.delete", { commentId: id, authorId });
  res.status(200).json({ message: "Comment deleted successfully" });
};
