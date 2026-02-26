import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { logAction } from "../../config/logger.js";

export const toogleBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;

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

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: { id: existingBookmark.id },
    });
    logAction("bookmark.remove", { postId, userId });
    res.status(200).json({ message: "Bookmark removed" });
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        postId,
      },
    });
    logAction("bookmark.add", { postId, userId });
    res.status(201).json({ message: "Bookmark added" });
  }
};

export const getMyBookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const [bookmarks, totalBookmarks] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            publishedAt: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  logAction("bookmarks.my_bookmarks", { userId, page, limit });
  res.status(200).json({
    bookmarks: bookmarks.map((b) => ({
      bookmarkId: b.id,
      bookarkedAt: b.createdAt,
      post: {
        id: b.post.id,
        title: b.post.title,
        slug: b.post.slug,
        coverImage: b.post.coverImage,
        publishedAt: b.post.publishedAt,
        author: b.post.author,
        likesCount: b.post._count.likes,
        commentsCount: b.post._count.comments,
      }
    })),
    pagination: {
      page,
      limit,
      total: totalBookmarks,
      totalPages: Math.ceil(totalBookmarks / limit),
      hasMore: skip + limit < totalBookmarks,
    }
  })
};
