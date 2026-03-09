"use server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateAccountAction(data: {
  name?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true },
  });

  if (!currentUser) return { error: "Usuário não encontrado" };

  const isOAuth = currentUser.accounts.length > 0;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { name: data.name, username: data.username };

    if (data.email && data.email !== currentUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) return { error: "Este e-mail já está em uso." };
      updateData.email = data.email;
    }

    if (data.newPassword && !isOAuth) {
      if (!data.currentPassword) return { error: "Informe a senha atual." };

      const passwordMatch = await bcrypt.compare(
        data.currentPassword,
        currentUser.passwordHash || "",
      );
      if (!passwordMatch) return { error: "Senha atual incorreta." };

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    return { success: "Conta atualizada com sucesso!" };
  } catch (error) {
    return { error: "Erro ao processar atualização." };
  }
}
