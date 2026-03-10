import { z } from "zod";

export const CreateSemesterSchema = z.object({
  period: z.string().min(1, "O período é obrigatório"),
  status: z.enum(["CONCLUIDO", "CURSANDO", "PENDENTE"]),
  yieldCoefficient: z.number().optional().nullable(),
  userId: z.string().min(1, "O ID do usuário é obrigatório"),
});

export const UpdateSemesterSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
  period: z.string().min(1, "O período é obrigatório").optional(),
  status: z.enum(["CONCLUIDO", "CURSANDO", "PENDENTE"]).optional(),
  yieldCoefficient: z.number().optional().nullable(),
});

export const DeleteSemesterSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});
