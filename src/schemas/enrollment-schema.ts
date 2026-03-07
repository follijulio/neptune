import { z } from "zod";

export const CreateEnrollmentSchema = z.object({
  status: z.enum(["APROVADO", "REPROVADO", "CURSANDO", "PENDENTE"]),
  grade: z.number().nonnegative().max(10).optional().nullable(),
  absences: z.number().int().nonnegative().optional().nullable(),
  maxAbsences: z.number().int().nonnegative().optional().nullable(),
  userId: z.string().min(1, "O ID do usuário é obrigatório"),
  subjectId: z.string().min(1, "O ID da disciplina é obrigatório"),
  semesterId: z.string().optional().nullable(),
});

export const UpdateEnrollmentSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
  status: z.enum(["APROVADO", "REPROVADO", "CURSANDO", "PENDENTE"]).optional(),
  grade: z.number().nonnegative().max(10).optional().nullable(),
  absences: z.number().int().nonnegative().optional().nullable(),
  maxAbsences: z.number().int().nonnegative().optional().nullable(),
  semesterId: z.string().optional().nullable(),
});

export const DeleteEnrollmentSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});
