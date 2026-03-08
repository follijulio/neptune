"use server";

import { prisma } from "@/prisma/lib/prisma";
import { signIn, signOut } from "@/src/auth";
import { sendTwoFactorEmail } from "@/src/lib/mail";
import { generateTwoFactorToken } from "@/src/lib/tokens";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const code = formData.get("code") as string | null;

  if (!email || !password) return { error: "Preencha todos os campos." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return { error: "E-mail ou senha incorretos." };
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) return { error: "E-mail ou senha incorretos." };

    if (code) {
      const twoFactorToken = await prisma.twoFactorToken.findFirst({
        where: { email },
      });

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Código inválido." };
      }

      if (new Date() > new Date(twoFactorToken.expires)) {
        return { error: "Código expirado." };
      }

      await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation =
        await prisma.twoFactorConfirmation.findUnique({
          where: { userId: user.id },
        });

      if (existingConfirmation) {
        await prisma.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await prisma.twoFactorConfirmation.create({
        data: { userId: user.id },
      });

      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(user.email);
      await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Erro na autenticação." };
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function createAccountWithoutGoogle() {
  await signIn("credentials", {
    email: `${Date.now()}@example.com`,
    password: "randompassword",
    redirectTo: "/dashboard",
  });
}
