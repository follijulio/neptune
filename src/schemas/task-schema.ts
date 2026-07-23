import { z } from "zod";

export const subtaskSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  done: z.boolean().default(false),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(["hoje", "semana", "mes", "superfluo"]),
  priority: z.enum(["baixa", "media", "alta"]),
  date: z.date().optional().nullable(),
  order: z.number().int().default(0),
  subtasks: z.array(subtaskSchema).optional(),
});

export const updateTaskOrderSchema = z.object({
  id: z.string(),
  category: z.enum(["hoje", "semana", "mes", "superfluo"]),
  order: z.number().int(),
});

export type TaskInput = z.infer<typeof taskSchema>;
