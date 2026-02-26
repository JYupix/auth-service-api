import { Response, Request, NextFunction } from "express";
import { prisma } from "../../config/db.js";
import { generateSlug } from "../../utils/generateSlug.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema.js";
import { logAction } from "../../config/logger.js";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const categories = await prisma.category.findMany({
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

  logAction("categories.list");
  res.status(200).json({
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      postsCount: category._count.posts,
    })),
  });
};

export const getPostsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        deletedAt: null,
        categoryId: category.id,
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
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.post.count({
      where: {
        published: true,
        deletedAt: null,
        categoryId: category.id,
      },
    }),
  ]);

  logAction("categories.posts_by_category", { slug, page, limit });
  res.status(200).json({
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
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

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { name } = createCategorySchema.parse(req.body);
  const slug = generateSlug(name);

  const category = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  logAction("category.create", { name, slug, userId: req.user?.userId });
  res.status(201).json({ category });
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;
  const { name } = updateCategorySchema.parse(req.body);

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }

  const newSLug = name ? generateSlug(name) : undefined;

  const updatedCategory = await prisma.category.update({
    where: { slug },
    data: {
      ...(name && { name }),
      ...(newSLug && { slug: newSLug }),
    },
  });
  
  logAction("category.update", { slug, userId: req.user?.userId });
  res.status(200).json({ category: updatedCategory });
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const slug = req.params.slug as string;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }

  await prisma.category.delete({
    where: { slug },
  });

  logAction("category.delete", { slug, userId: req.user?.userId });
  res.status(200).json({ message: "Category deleted successfully" });
};
