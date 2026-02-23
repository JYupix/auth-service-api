import { Request, Response, NextFunction } from "express";
import { createPostSchema, updatePostSchema } from "./posts.schema.js";
import { prisma } from "../../config/db.js";
import { generateSlug } from "../../utils/generateSlug.js";
import { Prisma } from "@prisma/client";

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;

  const where = {
    published: true,
    deletedAt: null,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { content: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.post.count({ where }),
  ]);

  res.status(200).json({
    posts,
    pagination: {
      page,
      limit,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: skip + limit < totalPosts,
    },
  });
};

export const getMyPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const [myPosts, totalMyPosts] = await Promise.all([
    prisma.post.findMany({
      where: { authorId, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.post.count({
      where: { authorId, deletedAt: null },
    }),
  ]);

  res.status(200).json({
    posts: myPosts,
    pagination: {
      page,
      limit,
      total: totalMyPosts,
      totalPages: Math.ceil(totalMyPosts / limit),
      hasMore: skip + limit < totalMyPosts,
    },
  });
};

export const getPostBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;

  const post = await prisma.post.findUnique({
    where: { slug, published: true, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      publishedAt: true,
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

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.status(200).json({ post });
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { title, content, published, categoryId, tags } =
    createPostSchema.parse(req.body);
  const authorId = req.user?.userId;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const slug = generateSlug(title);

  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
  }

  let tagIds: string[] = [];

  if (tags && tags.length > 0) {
    const tagPromises = tags.map(async (tagName) => {
      const tagSlug = generateSlug(tagName);

      // Buscar o crear tag
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: {
          name: tagName,
          slug: tagSlug,
        },
      });

      return tag.id;
    });

    tagIds = await Promise.all(tagPromises);
  }

  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      slug,
      authorId,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      categoryId: categoryId || null,
      tags: {
        create: tagIds.map((tagId) => ({
          tagId,
        })),
      },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({ post: newPost });
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;
  const { title, content, published, categoryId, tags } =
    updatePostSchema.parse(req.body);
  const authorId = req.user?.userId;
  const userRole = req.user?.role;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const isAdmin = userRole === "ADMIN";
  const isAuthor = post.authorId === authorId;

  if (!isAuthor && !isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
  }

  const data: Prisma.PostUpdateInput = {};

  if (title) {
    data.title = title;
    data.slug = generateSlug(title);
  }

  if (content) {
    data.content = content;
  }

  if (published !== undefined) {
    data.published = published;
    data.publishedAt = published ? post.publishedAt || new Date() : null;
  }

  if (categoryId !== undefined) {
    if (categoryId === null) {
      data.category = { disconnect: true };
    } else {
      data.category = { connect: { id: categoryId } };
    }
  }

  if (tags) {
    await prisma.postTag.deleteMany({
      where: { postId: id },
    });

    const tagPromises = tags.map(async (tagName) => {
      const tagSlug = generateSlug(tagName);

      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: {
          name: tagName,
          slug: tagSlug,
        },
      });

      return tag.id;
    });

    const tagIds = await Promise.all(tagPromises);

    data.tags = {
      create: tagIds.map((tagId) => ({
        tagId,
      })),
    };
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({ post: updatedPost });
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;
  const authorId = req.user?.userId;
  const userRole = req.user?.role;

  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const isAdmin = userRole === "ADMIN";
  const isAuthor = post.authorId === authorId;

  if (!isAuthor && !isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({ message: "Post deleted successfully" });
};
