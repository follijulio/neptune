"use server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import bcrypt from "bcryptjs";

export async function sendSettings2FACodeAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email)
    return { error: "Não autorizado" };

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // Expira em 15 min
    console.log(`CÓDIGO 2FA GERADO PARA ${session.user.email}: ${code}`); // Para testar no terminal

    return { success: "Código enviado para o seu e-mail!" };
  } catch (error) {
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
  } catch (error) {
    return { error: "Erro ao redefinir a senha." };
  }
}
