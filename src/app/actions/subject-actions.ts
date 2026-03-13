"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

export async function updateSubjectGradesAction(
  subjectId: string,
  data: {
    ab1?: number | null;
    ab2?: number | null;
    reav?: number | null;
    finalExam?: number | null;
  },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (typeof subjectId !== "string" || !subjectId.trim()) {
    return { error: "ID inválido." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const validateGrade = (grade: unknown): number | null => {
    if (grade === null || grade === undefined) return null;
    const num = Number(grade);
    if (isNaN(num) || num < 0 || num > 100) throw new Error();
    return num;
  };

  try {
    const ab1 = validateGrade(data.ab1);
    const ab2 = validateGrade(data.ab2);
    const reav = validateGrade(data.reav);
    const finalExam = validateGrade(data.finalExam);

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

    await prisma.subject.update({
      where: { id: subject.id },
      data: { ab1, ab2, reav, finalExam },
    });

    revalidatePath("/semester");
    return { success: "Notas atualizadas com sucesso!" };
  } catch {
    return {
      error: "Falha ao salvar as notas. Verifique os valores inseridos.",
    };
  }
}

export async function updateSubjectAbsencesAction(
  subjectId: string,
  absences: number,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (typeof subjectId !== "string" || !subjectId.trim()) {
    return { error: "ID da disciplina não fornecido." };
  }

  if (
    typeof absences !== "number" ||
    isNaN(absences) ||
    absences < 0 ||
    !Number.isInteger(absences)
  ) {
    return { error: "Valor de faltas inválido." };
  }

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

    await prisma.subject.update({
      where: { id: subject.id },
      data: { currentAbsences: absences },
    });

    revalidatePath("/dashboard");
    revalidatePath("/semester");
    return { success: true };
  } catch {
    return { error: "Erro no banco de dados ao salvar faltas." };
  }
}

export async function createSubjectAction(data: {
  name: string;
  workload: number;
  semesterId: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const workload = typeof data.workload === "number" ? data.workload : 0;
  const semesterId =
    typeof data.semesterId === "string" ? data.semesterId.trim() : "";

  if (!name || name.length > 150) {
    return { error: "Nome da disciplina inválido." };
  }

  if (
    isNaN(workload) ||
    workload <= 0 ||
    workload > 1000 ||
    !Number.isInteger(workload)
  ) {
    return { error: "Carga horária inválida." };
  }

  if (!semesterId) {
    return { error: "ID do semestre inválido." };
  }

  try {
    const semester = await prisma.semester.findFirst({
      where: { id: semesterId, userId: session.user.id },
      select: { id: true },
    });

    if (!semester) {
      return { error: "Semestre não encontrado ou acesso negado." };
    }

    const maxAbsences = Math.floor(workload * 0.25);

    await prisma.subject.create({
      data: {
        name,
        workload,
        maxAbsences,
        semesterId: semester.id,
      },
    });

    revalidatePath("/semester");
    return { success: "Disciplina adicionada com sucesso!" };
  } catch {
    return { error: "Falha ao adicionar a disciplina." };
  }
}

export async function deleteSubjectAction(subjectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (typeof subjectId !== "string" || !subjectId.trim()) {
    return { error: "ID da disciplina não fornecido." };
  }

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

    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { subjectId: subject.id } }),
      prisma.subject.delete({ where: { id: subject.id } }),
    ]);

    revalidatePath("/semester");
    revalidatePath("/dashboard");
    return { success: "Disciplina eliminada!" };
  } catch {
    return {
      error: "Não foi possível apagar. Verifique se há dados dependentes.",
    };
  }
}

export async function updateSubjectBaseAction(
  subjectId: string,
  data: { name: string; workload: number },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (typeof subjectId !== "string" || !subjectId.trim()) {
    return { error: "ID inválido." };
  }

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const workload = typeof data.workload === "number" ? data.workload : 0;

  if (!name || name.length > 150) {
    return { error: "Nome da disciplina inválido." };
  }

  if (
    isNaN(workload) ||
    workload <= 0 ||
    workload > 1000 ||
    !Number.isInteger(workload)
  ) {
    return { error: "Carga horária inválida." };
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        semester: { userId: session.user.id },
      },
      select: { id: true, currentAbsences: true },
    });

    if (!subject) {
      return { error: "Disciplina não encontrada ou acesso negado." };
    }

    const newMaxAbsences = Math.floor(workload * 0.25);

    if (subject.currentAbsences > newMaxAbsences) {
      return {
        error: `Operação bloqueada! Você já tem ${subject.currentAbsences} faltas. A carga de ${workload}h só permite ${newMaxAbsences} faltas.`,
      };
    }

    await prisma.subject.update({
      where: { id: subject.id },
      data: {
        name,
        workload,
        maxAbsences: newMaxAbsences,
      },
    });

    revalidatePath("/semester");
    revalidatePath("/dashboard");
    return { success: "Disciplina atualizada com sucesso!" };
  } catch {
    return { error: "Falha ao editar a disciplina." };
  }
}
