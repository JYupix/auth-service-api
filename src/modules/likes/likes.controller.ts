import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { logAction } from "../../config/logger.js";

export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId as string;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, published: true, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });

    logAction("post.unlike", { postId, userId });
    res.status(200).json({ message: "Post unliked" });
    return;
  }

  await prisma.like.create({
    data: {
      userId,
      postId,
    },
  });

  logAction("post.like", { postId, userId });
  res.status(201).json({ message: "Post liked" });
};

export const getLikesForPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const postId = req.params.id as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const post = await prisma.post.findUnique({
    where: { id: postId, published: true, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const [likes, totalLikes] = await Promise.all([
    prisma.like.findMany({
      where: { postId },
      select: {
        user: {
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
    prisma.like.count({
      where: { postId },
    }),
  ]);

  logAction("likes.list", { postId });
  res.status(200).json({
    likes: likes.map((like) => like.user),
    pagination: {
      page,
      limit,
      total: totalLikes,
      totalPages: Math.ceil(totalLikes / limit),
      hasMore: skip + limit < totalLikes,
    },
  });
};
