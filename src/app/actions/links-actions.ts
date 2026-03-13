"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createLinkAction(data: {
  title: string;
  url: string;
  icon: string;
}) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const url = typeof data.url === "string" ? data.url.trim() : "";
  const icon = typeof data.icon === "string" ? data.icon.trim() : "";

  if (!title || title.length > 100) return { error: "Título inválido." };
  if (!url || url.length > 2048 || !isValidUrl(url))
    return { error: "URL inválida." };
  if (!icon || icon.length > 50) return { error: "Ícone inválido." };

  try {
    await prisma.link.create({
      data: {
        title,
        url,
        icon,
        userId: session.user.id,
      },
    });

    revalidatePath("/links");

    return { success: "Link adicionado!" };
  } catch {
    return { error: "Erro ao criar link." };
  }
}

export async function deleteLinkAction(id: string) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (typeof id !== "string" || !id.trim()) {
    return { error: "ID inválido." };
  }

  try {
    const result = await prisma.link.deleteMany({
      where: {
        id: id.trim(),
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return { error: "Link não encontrado ou acesso negado." };
    }

    revalidatePath("/links");

    return { success: "Link removido!" };
  } catch {
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

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const id = typeof data.id === "string" ? data.id.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const url = typeof data.url === "string" ? data.url.trim() : "";
  const icon = typeof data.icon === "string" ? data.icon.trim() : undefined;

  if (!id) return { error: "ID inválido." };
  if (!title || title.length > 100) return { error: "Título inválido." };
  if (!url || url.length > 2048 || !isValidUrl(url))
    return { error: "URL inválida." };
  if (icon !== undefined && icon.length > 50)
    return { error: "Ícone inválido." };

  try {
    const result = await prisma.link.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        title,
        url,
        icon,
      },
    });

    if (result.count === 0) {
      return { error: "Link não encontrado ou acesso negado." };
    }

    revalidatePath("/links");

    return { success: true };
  } catch {
    return { error: "Falha ao atualizar o atalho." };
  }
}
