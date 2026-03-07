import { z } from "zod";

export const CreateWorkloadSchema = z.object({
  category: z.string().min(1, "A categoria é obrigatória"),
  totalHours: z.number().int().nonnegative("Total de horas inválido"),
  completedHours: z.number().int().nonnegative("Horas concluídas inválidas"),
  userId: z.string().min(1, "O ID do usuário é obrigatório"),
});

export const UpdateWorkloadSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
  category: z.string().min(1, "A categoria não pode ser vazia").optional(),
  totalHours: z.number().int().nonnegative("Total de horas inválido").optional(),
  completedHours: z.number().int().nonnegative("Horas concluídas inválidas").optional(),
});

export const DeleteWorkloadSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});