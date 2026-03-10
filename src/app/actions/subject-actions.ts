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
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    // Garante que a disciplina pertence ao semestre do usuário atual
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { semester: true },
    });

    if (!subject || subject.semester.userId !== session.user.id) {
      return { error: "Disciplina não encontrada ou acesso negado." };
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        ab1: data.ab1,
        ab2: data.ab2,
        reav: data.reav,
        finalExam: data.finalExam,
      },
    });

    revalidatePath("/semester");
    return { success: "Notas atualizadas com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar notas:", error);
    return { error: "Falha ao salvar as notas." };
  }
}

export async function updateSubjectAbsencesAction(
  subjectId: string,
  absences: number,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.subject.update({
      where: { id: subjectId },
      data: { currentAbsences: absences },
    });

    revalidatePath("/semester");
    return { success: "Faltas atualizadas!" };
  } catch (error) {
    return { error: "Falha ao atualizar faltas." };
  }
}
