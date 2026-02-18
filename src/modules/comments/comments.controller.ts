import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { createCommentSchema, updateCommentSchema } from "./comments.schema.js";

export const getCommentsByPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id as string;

  const post = await prisma.post.findUnique({
    where: { id, published: true, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const comments = await prisma.comment.findMany({
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
  });

  res.status(200).json({
    comments,
    count: comments.length,
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

  res.status(201).json({ comment });
};

export const getMyComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorId = req.user?.userId as string;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const comments = await prisma.comment.findMany({
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
  });

  res.status(200).json({
    comments,
    count: comments.length,
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

  if (comment.authorId !== authorId) {
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

  res.status(200).json({ comment: updatedComment });
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;
  const authorId = req.user?.userId as string;

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

  if (comment.authorId !== authorId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.status(204).send();
};
