"use server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import bcrypt from "bcryptjs";

export async function sendSettings2FACodeAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email)
    return { error: "Não autorizado" };

  // TODO: precisa ser implementado o envio real do código por email... (esqueci rsrs)
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // TODO: alterar pra 5 minutos, mas por enquanto - até terminar o calendar - vou deixar 15 minutos pra facilitar os testes
    const expiresIn = 15 * 60 * 1000; // 15 minutos
    const expires = new Date(new Date().getTime() + expiresIn);
    console.log(`CÓDIGO 2FA GERADO PARA ${session.user.email}: ${code}`);
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
