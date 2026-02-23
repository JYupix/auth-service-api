import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "Name is required"),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(3, "Name is required").optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;