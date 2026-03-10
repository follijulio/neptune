/* eslint-disable @typescript-eslint/no-unused-vars */
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
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        color: data.color || "#1A1A1A",
        userId: session.user.id,
        subjectId: data.subjectId || null,
      },
    });

    revalidatePath("/mural");
    return { success: "Anotação criada com sucesso!" };
  } catch (error) {
    return { error: "Erro ao criar anotação." };
  }
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.note.delete({
      where: { id: noteId, userId: session.user.id },
    });

    revalidatePath("/mural");
    return { success: "Anotação apagada" };
  } catch (error) {
    return { error: "Erro ao apagar anotação" };
  }
}

export async function findNotesAction(userId: string) {
  const notes = await prisma.note.findMany({
    where: { userId: userId },
    orderBy: { position: "asc" },
  });
  return notes;
}

export async function reorderNotesAction(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "sem autorização" };

  try {
    const updates = orderedIds.map((id, index) =>
      prisma.note.update({
        where: { id, userId: session.user?.id },
        data: { position: index },
      }),
    );

    await prisma.$transaction(updates);

    return { success: true };
  } catch (error) {
    return { error: "Erro ao tentar salvar nova ordem" };
  }
}
