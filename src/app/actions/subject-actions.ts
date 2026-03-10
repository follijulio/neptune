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

  if (!subjectId) {
    console.error("ERRO: Tentativa de atualizar faltas sem subjectId!");
    return { error: "ID da disciplina não fornecido." };
  }

  try {
    await prisma.subject.update({
      where: { id: subjectId },
      data: { currentAbsences: absences },
    });

    revalidatePath("/dashboard");
    revalidatePath("/semester");
    return { success: true };
  } catch (error) {
    console.error("ERRO PRISMA:", { error });
    return { error: "Erro no banco de dados ao salvar faltas." };
  }
}
export async function createSubjectAction(data: {
  name: string;
  workload: number;
  semesterId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const maxAbsences = Math.floor(data.workload * 0.25);

    await prisma.subject.create({
      data: {
        name: data.name,
        workload: data.workload,
        maxAbsences,
        semesterId: data.semesterId,
      },
    });

    revalidatePath("/semester");
    return { success: "Disciplina adicionada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar disciplina:", error);
    return { error: "Falha ao adicionar a disciplina." };
  }
}

export async function deleteSubjectAction(subjectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { subjectId } }),
      prisma.subject.delete({ where: { id: subjectId } }),
    ]);

    revalidatePath("/semester");
    revalidatePath("/dashboard");
    return { success: "Disciplina eliminada!" };
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return {
      error: "Não foi possível apagar. Verifique se há dados dependentes.",
    };
  }
}
