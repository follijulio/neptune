"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { createFullCalendarEventAction } from "./calendar-actions";

export async function createSubjectNoteAction(data: {
  subjectId: string;
  title: string;
  content: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const note = await prisma.subjectNote.create({
      data: {
        title: data.title,
        content: data.content,
        subjectId: data.subjectId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/semester");
    return { success: true, note };
  } catch (error) {
    console.error("Erro ao criar anotação:", error);
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
  console.log("chegou aqui essa porra");
  console.log(data);

  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { name: true },
    });

    if (!subject) return { error: "Disciplina não encontrada." };

    const eventDescription = `Evento criado em ${new Date().toLocaleDateString()} para a disciplina de ${subject.name}`;
    const endDate = new Date(data.examDate);
    endDate.setHours(endDate.getHours() + 2 );

    const calendarResult = await createFullCalendarEventAction({
      title: data.title,
      description: eventDescription,
      date: data.examDate.toISOString(),
      color: data.color || "11",
    });

    const internalEventId = calendarResult.internalId || null;
    const googleEventId = calendarResult.googleId || null;

    const newExam = await prisma.exam.create({
      data: {
        title: data.title,
        examDate: data.examDate,
        subjectId: data.subjectId,
        eventId: internalEventId,
        googleEventId: googleEventId,
      },
    });

    revalidatePath("/semester");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, exam: newExam };
  } catch (error) {
    console.error("Erro ao agendar prova:", error);
    return { error: "Falha ao agendar a prova." };
  }
}

//todo: lembrar de adicionar filtros, ou até paginação...
export async function getSubjectDetailsAction(subjectId: string) {
  try {
    const notes = await prisma.subjectNote.findMany({
      where: { subjectId },
      orderBy: { createdAt: "desc" },
    });

    const exams = await prisma.exam.findMany({
      where: { subjectId },
      orderBy: { examDate: "asc" },
    });

    return { success: true, notes, exams };
  } catch (error) {
    console.error("Erro ao buscar detalhes da disciplina:", error);
    return { error: "Falha ao carregar os dados." };
  }
}
