import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  name: z.string().min(2, "Nome muito curto"),
  userName: z.string().min(2, "Nome de usuário muito curto"),
  profileImageUrl: z.string().url("URL de imagem de perfil inválida"),
});
