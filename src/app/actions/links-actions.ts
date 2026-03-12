/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

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

export async function updateLinkAction(data: {
  id: string;
  title: string;
  url: string;
  icon?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const updatedLink = await prisma.link.update({
      where: {
        id: data.id,
        userId: session.user.id,
      },
      data: {
        title: data.title,
        url: data.url,
        icon: data.icon,
      },
    });

    revalidatePath("/links");
    return { success: true, link: updatedLink };
  } catch (error) {
    console.error("Erro ao atualizar o link:", error);
    return { error: "Falha ao atualizar o atalho." };
  }
}
