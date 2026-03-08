"use server";

import { prisma } from "@/prisma/lib/prisma";
import { signIn } from "@/src/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);

    await signIn("credentials", {
      ...data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Este e-mail já está em uso." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        username: email.split("@")[0],
        passwordHash: hashedPassword,
      },
    });
  } catch (dbError) {
    return { error: "Erro ao salvar no banco de dados. Verifique o console." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas houve um erro ao fazer login." };
    }
    throw error;
  }
}
