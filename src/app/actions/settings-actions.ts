"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { Prisma } from "@/prisma/generated/prisma/client";
import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isValidUsername(username: string) {
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  return (
    usernameRegex.test(username) &&
    username.length >= 3 &&
    username.length <= 30
  );
}

export async function updateAccountAction(data: {
  name?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        accounts: { select: { id: true } },
      },
    });

    if (!currentUser) {
      return { error: "Usuário não encontrado." };
    }

    const isOAuth = currentUser.accounts.length > 0;
    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) {
      if (
        typeof data.name !== "string" ||
        data.name.trim().length === 0 ||
        data.name.length > 255
      ) {
        return { error: "Nome inválido." };
      }
      updateData.name = data.name.trim();
    }

    if (data.username !== undefined) {
      if (
        typeof data.username !== "string" ||
        !isValidUsername(data.username)
      ) {
        return {
          error:
            "Nome de usuário inválido. Use apenas letras, números, pontos, traços ou underscores (3 a 30 caracteres).",
        };
      }
      updateData.username = data.username.trim().toLowerCase();
    }

    if (data.email !== undefined && data.email !== currentUser.email) {
      if (typeof data.email !== "string" || !isValidEmail(data.email)) {
        return { error: "Formato de e-mail inválido." };
      }

      const normalizedEmail = data.email.trim().toLowerCase();

      const emailExists = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (emailExists && emailExists.id !== currentUser.id) {
        return { error: "Este e-mail já está em uso." };
      }

      updateData.email = normalizedEmail;
    }

    if (data.newPassword !== undefined) {
      if (isOAuth) {
        return {
          error:
            "Contas vinculadas ao Google não podem alterar a senha por aqui.",
        };
      }

      if (
        typeof data.newPassword !== "string" ||
        data.newPassword.length < 6 ||
        data.newPassword.length > 72
      ) {
        return { error: "A nova senha deve ter entre 6 e 72 caracteres." };
      }

      if (typeof data.currentPassword !== "string" || !data.currentPassword) {
        return { error: "Informe a senha atual." };
      }

      const passwordMatch = await bcrypt.compare(
        data.currentPassword,
        currentUser.passwordHash || "",
      );

      if (!passwordMatch) {
        return { error: "Senha atual incorreta." };
      }

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return { success: "Nenhuma alteração detectada." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: "Conta atualizada com sucesso!" };
  } catch {
    return { error: "Erro ao processar atualização. Tente novamente." };
  }
}
