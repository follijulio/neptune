"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

export async function createNoteAction(data: {
  title: string;
  content: string;
  color?: string;
  subjectId?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const content = typeof data.content === "string" ? data.content.trim() : "";
  const color = typeof data.color === "string" ? data.color.trim() : "#1A1A1A";
  const subjectId =
    typeof data.subjectId === "string" ? data.subjectId.trim() : undefined;

  if (!title || title.length > 255) return { error: "Título inválido." };
  if (content.length > 10000)
    return { error: "O conteúdo excede o limite permitido." };
  if (color.length > 50) return { error: "Cor inválida." };

  try {
    await prisma.note.create({
      data: {
        title,
        content,
        color,
        userId: session.user.id,
        subjectId: subjectId || null,
      },
    });

    revalidatePath("/mural");
    return { success: "Anotação criada com sucesso!" };
  } catch {
    return { error: "Erro ao criar anotação." };
  }
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (typeof noteId !== "string" || !noteId.trim()) {
    return { error: "ID inválido." };
  }

  try {
    const result = await prisma.note.deleteMany({
      where: {
        id: noteId.trim(),
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return { error: "Anotação não encontrada ou acesso negado." };
    }

    revalidatePath("/mural");
    return { success: "Anotação apagada" };
  } catch {
    return { error: "Erro ao apagar anotação" };
  }
}

export async function findNotesAction(userId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.id !== userId) {
    return [];
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { position: "asc" },
    });
    return notes;
  } catch {
    return [];
  }
}

export async function reorderNotesAction(orderedIds: string[]) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (!Array.isArray(orderedIds) || orderedIds.length > 2000) {
    return { error: "Dados inválidos." };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      prisma.note.updateMany({
        where: {
          id: String(id),
          userId: session.user?.id,
        },
        data: { position: index },
      }),
    );

    await prisma.$transaction(updates);

    return { success: true };
  } catch {
    return { error: "Erro ao tentar salvar nova ordem" };
  }
}

export async function updateNoteAction(data: {
  id: string;
  title: string;
  content: string;
  color?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado." };

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const id = typeof data.id === "string" ? data.id.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const content = typeof data.content === "string" ? data.content.trim() : "";
  const color = typeof data.color === "string" ? data.color.trim() : undefined;

  if (!id) return { error: "ID inválido." };
  if (!title || title.length > 255) return { error: "Título inválido." };
  if (content.length > 10000)
    return { error: "O conteúdo excede o limite permitido." };
  if (color !== undefined && color.length > 50)
    return { error: "Cor inválida." };

  try {
    const result = await prisma.note.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        title,
        content,
        color,
      },
    });

    if (result.count === 0) {
      return { error: "Anotação não encontrada ou acesso negado." };
    }

    revalidatePath("/mural");
    return { success: true };
  } catch {
    return { error: "Falha ao atualizar a nota." };
  }
}
