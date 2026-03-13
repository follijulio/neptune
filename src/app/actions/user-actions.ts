"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

function isValidImageUrl(url: string) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateUserImageAction(imageUrl: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (typeof imageUrl !== "string") {
    return { error: "Dados inválidos." };
  }

  const trimmedUrl = imageUrl.trim();

  if (trimmedUrl.length > 2048 || !isValidImageUrl(trimmedUrl)) {
    return { error: "URL de imagem inválida." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: trimmedUrl || null },
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/", "layout");

    return { success: true };
  } catch {
    return { error: "Falha ao salvar a imagem." };
  }
}
