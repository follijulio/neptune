import { z } from "zod";

export const CreateSubjectSchema = z.object({
  code: z.string().min(1, "O código da disciplina é obrigatório"),
  name: z.string().min(1, "O nome da disciplina é obrigatório"),
});