"use server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";

export async function updateUserImageAction(imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar foto:", error);
    return { error: "Falha ao salvar a imagem." };
  }
}
