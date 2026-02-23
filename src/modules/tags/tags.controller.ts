import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { createTagSchema, updateTagSchema } from "./tags.schema.js";
import { generateSlug } from "../../utils/generateSlug.js";

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  res.status(200).json({
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postsCount: tag._count.posts,
    })),
  });
};

export const getPostsByTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    res.status(404).json({ message: "Tag not found" });
    return;
  }

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        deletedAt: null,
        tags: { some: { tagId: tag.id } },
      },
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
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.post.count({
      where: {
        published: true,
        deletedAt: null,
        tags: { some: { tagId: tag.id } },
      },
    }),
  ]);

  res.status(200).json({
    tag: {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    },
    posts,
    pagination: {
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: skip + limit < totalPosts,
    },
  });
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { name } = createTagSchema.parse(req.body);

  const slug = generateSlug(name);

  const tag = await prisma.tag.create({
    data: {
      name,
      slug,
    },
  });

  res.status(201).json({ tag });
};

export const updateTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;
  const { name } = updateTagSchema.parse(req.body);

  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    res.status(404).json({ message: "Tag not found" });
    return;
  }

  const newSlug = name ? generateSlug(name) : tag.slug;

  const updatedTag = await prisma.tag.update({
    where: { slug },
    data: {
      name: name ?? tag.name,
      slug: newSlug,
    },
  });

  res.status(200).json({ tag: updatedTag });
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;
  
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    res.status(404).json({ message: "Tag not found" });
    return;
  }

  await prisma.tag.delete({
    where: { slug },
  });

  res.status(200).json({ message: "Tag deleted successfully" });
};
