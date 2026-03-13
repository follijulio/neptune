"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { prisma } from "@/prisma/lib/prisma";
import { signIn, signOut } from "@/src/auth";
import { sendVerificationEmail } from "@/src/lib/mail";
import { generateTwoFactorToken } from "@/src/lib/tokens";

const DUMMY_HASH =
  "$2a$12$wJjM3CwYch0eYRqpMfrQa.u1Gc7YCOUMIqFZRMVAb9Y/jGj33jjGa";

const MAX_USERNAME_LENGTH = 30;

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

async function generateUniqueUsername(
  tx: {
    user: {
      findUnique: (args: { where: { username: string } }) => Promise<unknown>;
    };
  },
  email: string
): Promise<string> {
  const localPart = email.split("@")[0] ?? "";
  const sanitizedBase = localPart.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  const randomSuffix = () => Math.random().toString(36).slice(2, 8);

  let base = sanitizedBase || `user${randomSuffix()}`;

  if (base.length > MAX_USERNAME_LENGTH) {
    base = base.slice(0, MAX_USERNAME_LENGTH);
  }

  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = attempt === 0 ? "" : `_${attempt}`;
    const allowedBaseLength = MAX_USERNAME_LENGTH - suffix.length;

    let candidateBase = base;
    if (candidateBase.length > allowedBaseLength) {
      candidateBase = candidateBase.slice(0, allowedBaseLength);
    }

    const candidate = `${candidateBase}${suffix}`;

    const existing = await tx.user.findUnique({
      where: { username: candidate },
    });

    if (!existing) {
      return candidate;
    }
  }

  // Fallback to a fully random username if all attempts collide
  return `user${randomSuffix()}`.slice(0, MAX_USERNAME_LENGTH);
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const code = formData.get("code") as string | null;

  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { error: "Preencha todos os campos corretamente." };
  }

  if (!isValidEmail(email) || password.length > 72) {
    return { error: "Credenciais inválidas." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    const hashToCompare = user?.passwordHash || DUMMY_HASH;
    const passwordsMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !user.passwordHash || !passwordsMatch) {
      return { error: "E-mail ou senha incorretos." };
    }

    if (code) {
      if (
        typeof code !== "string" ||
        code.length !== 6 ||
        !/^\d+$/.test(code)
      ) {
        return { error: "Código com formato inválido." };
      }

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
      await sendVerificationEmail(twoFactorToken.email, twoFactorToken.token);

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
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (
    !name ||
    !email ||
    !password ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { error: "Preencha todos os campos corretamente." };
  }

  if (!isValidEmail(email)) {
    return { error: "Formato de e-mail inválido." };
  }

  if (password.length < 6 || password.length > 72) {
    return { error: "A senha deve ter entre 6 e 72 caracteres." };
  }

  if (name.length > 255 || name.trim().length === 0) {
    return { error: "Nome inválido." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Este e-mail já está em uso." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const normalizedEmail = email.toLowerCase();
      const username = await generateUniqueUsername(tx, normalizedEmail);

      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          username,
          passwordHash: hashedPassword,
        },
      });

      await tx.twoFactorConfirmation.create({
        data: { userId: user.id },
      });
    });
  } catch {
    return {
      error:
        "Não foi possível criar a conta no momento. Tente novamente mais tarde.",
    };
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
