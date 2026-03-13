"use server";

import { revalidatePath } from "next/cache";

import {
  createFullCalendarEventAction,
  updateFullCalendarEventAction,
} from "./calendar-actions";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

export async function createSubjectNoteAction(data: {
  subjectId: string;
  title: string;
  content: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const subjectId =
    typeof data.subjectId === "string" ? data.subjectId.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const content = typeof data.content === "string" ? data.content.trim() : "";

  if (!subjectId) return { error: "ID da disciplina inválido." };
  if (!title || title.length > 255) return { error: "Título inválido." };
  if (content.length > 10000) return { error: "Conteúdo excede o limite." };

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        semester: { userId: session.user.id },
      },
      select: { id: true },
    });

    if (!subject) {
      return { error: "Disciplina não encontrada ou acesso negado." };
    }

    const note = await prisma.subjectNote.create({
      data: {
        title,
        content,
        subjectId: subject.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/semester");

    return { success: true, note };
  } catch {
    return { error: "Falha ao salvar a anotação." };
  }
}

export async function createExamAction(data: {
  subjectId: string;
  title: string;
  examDate: Date;
  description?: string;
  color?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const subjectId =
    typeof data.subjectId === "string" ? data.subjectId.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const color = typeof data.color === "string" ? data.color.trim() : "11";

  if (!subjectId) return { error: "ID da disciplina inválido." };
  if (!title || title.length > 255) return { error: "Título inválido." };

  const examDate = new Date(data.examDate);
  if (isNaN(examDate.getTime())) return { error: "Data inválida." };

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        semester: { userId: session.user.id },
      },
      select: { id: true, name: true },
    });

    if (!subject) {
      return { error: "Disciplina não encontrada ou acesso negado." };
    }

    const eventDescription = `Evento criado em ${new Date().toLocaleDateString()} para a disciplina de ${subject.name}`;

    const calendarResult = await createFullCalendarEventAction({
      title,
      description: eventDescription,
      date: examDate.toISOString(),
      color,
    });

    const newExam = await prisma.exam.create({
      data: {
        title,
        examDate,
        subjectId: subject.id,
        eventId: calendarResult.internalId || null,
        googleEventId: calendarResult.googleId || null,
      },
    });

    revalidatePath("/semester");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, exam: newExam };
  } catch {
    return { error: "Falha ao agendar a prova." };
  }
}

export async function getSubjectDetailsAction(subjectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (typeof subjectId !== "string" || !subjectId.trim()) {
    return { error: "ID inválido." };
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId.trim(),
        semester: { userId: session.user.id },
      },
      select: { id: true },
    });

    if (!subject) {
      return { error: "Disciplina não encontrada ou acesso negado." };
    }

    const [notes, exams, materials] = await prisma.$transaction([
      prisma.subjectNote.findMany({
        where: { subjectId: subject.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.exam.findMany({
        where: { subjectId: subject.id },
        orderBy: { examDate: "asc" },
      }),
      prisma.subjectMaterial.findMany({
        where: { subjectId: subject.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { success: true, notes, exams, materials };
  } catch {
    return { error: "Falha ao carregar os dados." };
  }
}

export async function updateSubjectNoteAction(data: {
  id: string;
  title: string;
  content: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const id = typeof data.id === "string" ? data.id.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const content = typeof data.content === "string" ? data.content.trim() : "";

  if (!id) return { error: "ID inválido." };
  if (!title || title.length > 255) return { error: "Título inválido." };
  if (content.length > 10000) return { error: "Conteúdo excede o limite." };

  try {
    const existingNote = await prisma.subjectNote.findFirst({
      where: {
        id,
        subject: { semester: { userId: session.user.id } },
      },
      select: { id: true },
    });

    if (!existingNote) {
      return { error: "Anotação não encontrada ou acesso negado." };
    }

    const updatedNote = await prisma.subjectNote.update({
      where: { id: existingNote.id },
      data: { title, content },
    });

    return { success: true, note: updatedNote };
  } catch {
    return { error: "Falha ao atualizar a anotação." };
  }
}

export async function updateExamAction(data: {
  id: string;
  title: string;
  examDate: Date;
  color: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const id = typeof data.id === "string" ? data.id.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const color = typeof data.color === "string" ? data.color.trim() : "11";

  if (!id) return { error: "ID inválido." };
  if (!title || title.length > 255) return { error: "Título inválido." };

  const examDate = new Date(data.examDate);
  if (isNaN(examDate.getTime())) return { error: "Data inválida." };

  try {
    const existingExam = await prisma.exam.findFirst({
      where: {
        id,
        subject: { semester: { userId: session.user.id } },
      },
      select: { id: true, eventId: true, subject: { select: { name: true } } },
    });

    if (!existingExam) {
      return { error: "Prova não encontrada ou acesso negado." };
    }

    const updatedExam = await prisma.exam.update({
      where: { id: existingExam.id },
      data: { title, examDate },
    });

    if (existingExam.eventId) {
      const eventDescription = `Evento modificado em ${new Date().toLocaleDateString()} para a disciplina de ${existingExam.subject.name}`;

      await updateFullCalendarEventAction({
        id: existingExam.eventId,
        title,
        description: eventDescription,
        date: examDate.toISOString(),
        color,
      });
    }

    revalidatePath("/semester");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, exam: updatedExam };
  } catch {
    return { error: "Falha ao atualizar a prova." };
  }
}
