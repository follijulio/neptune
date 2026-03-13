"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { sendVerificationEmail } from "@/src/lib/mail";
import { generateTwoFactorToken } from "@/src/lib/tokens";

export async function sendSettings2FACodeAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Não autorizado." };
  }

  try {
    const twoFactorToken = await generateTwoFactorToken(session.user.email);
    await sendVerificationEmail(twoFactorToken.email, twoFactorToken.token);
    return { success: "Código enviado para o seu e-mail!" };
  } catch {
    return { error: "Erro ao gerar o código 2FA." };
  }
}

export async function resetPasswordWith2FAAction(
  code: string,
  newPassword: string,
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Não autorizado." };
  }

  if (typeof code !== "string" || code.length !== 6 || !/^\d+$/.test(code)) {
    return { error: "Código com formato inválido." };
  }

  if (
    typeof newPassword !== "string" ||
    newPassword.length < 6 ||
    newPassword.length > 72
  ) {
    return { error: "A nova senha deve ter entre 6 e 72 caracteres." };
  }

  try {
    const twoFactorToken = await prisma.twoFactorToken.findFirst({
      where: { email: session.user.email },
    });

    if (!twoFactorToken || twoFactorToken.token !== code) {
      return { error: "Código inválido." };
    }

    if (new Date() > new Date(twoFactorToken.expires)) {
      return { error: "Código expirado." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user?.id },
        data: { passwordHash: hashedPassword },
      });

      await tx.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });
    });

    return { success: "Senha alterada com sucesso!" };
  } catch {
    return { error: "Erro ao redefinir a senha." };
  }
}
