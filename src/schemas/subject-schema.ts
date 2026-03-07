import { z } from "zod";

export const CreateSubjectSchema = z.object({
  code: z.string().min(1, "O código da disciplina é obrigatório"),
  name: z.string().min(1, "O nome da disciplina é obrigatório"),
});

export const UpdateSubjectSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
  code: z.string().min(1, "O código não pode ser vazio").optional(),
  name: z.string().min(1, "O nome não pode ser vazio").optional(),
});

export const DeleteSubjectSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});
