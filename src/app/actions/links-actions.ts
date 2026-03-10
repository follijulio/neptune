/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";

export async function createLinkAction(data: {
  title: string;
  url: string;
  icon: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.link.create({
      data: {
        title: data.title,
        url: data.url,
        icon: data.icon,
        userId: session.user.id,
      },
    });
    revalidatePath("/links");
    return { success: "Link adicionado!" };
  } catch (error) {
    return { error: "Erro ao criar link." };
  }
}

export async function deleteLinkAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.link.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/links");
    return { success: "Link removido!" };
  } catch (error) {
    return { error: "Erro ao remover link." };
  }
}
