"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { sendVerificationEmail } from "@/src/lib/mail";
import { generateTwoFactorToken } from "@/src/lib/tokens";

export async function sendSettings2FACodeAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email)
    return { error: "Não autorizado" };

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
  if (!session?.user?.id || !session.user.email)
    return { error: "Não autorizado" };

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword },
    });

    return { success: "Senha alterada com sucesso!" };
  } catch {
    return { error: "Erro ao redefinir a senha." };
  }
}
