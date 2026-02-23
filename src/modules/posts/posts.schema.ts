import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(50000, "Content must be less than 50,000 characters"),
  published: z.boolean().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags").optional(),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(50000, "Content must be less than 50,000 characters")
    .optional(),
  published: z.boolean().optional(),
  categoryId: z.string().nullable().optional(), 
  tags: z.array(z.string()).max(10, "Maximum 10 tags").optional(),
});
