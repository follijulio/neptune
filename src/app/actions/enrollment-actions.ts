"use server";

import { CreateEnrollmentController } from "@/src/adapters/controllers/enrollment/create-enrollment-controller";
import { DeleteEnrollmentController } from "@/src/adapters/controllers/enrollment/delete-enrollment-controller";
import { UpdateEnrollmentController } from "@/src/adapters/controllers/enrollment/update-enrollment-controller";
import { auth } from "@/src/auth";
import {
  CreateEnrollmentDto,
  EnrollmentResponse,
} from "@/src/domain/enrollment.dto";
import { UpdateEnrollmentDto } from "@/src/domain/enrollment.dto";
import {
  DeleteEnrollmentDto,
  DeleteEnrollmentResponse,
} from "@/src/domain/enrollment.dto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createEnrollmentAction(
  formData: CreateEnrollmentDto,
): Promise<EnrollmentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const { subjectId, semesterId } = formData as unknown as {
      subjectId?: string;
      semesterId?: string;
    };

    // Validação de pertencimento: subjectId/semesterId devem estar associados ao usuário autenticado.
    if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          semester: {
            userId: session.user.id,
          },
        },
      });

      if (!subject) {
        return {
          success: false,
          error: "Disciplina inválida ou não autorizada.",
        };
      }

      if (semesterId && subject.semesterId !== semesterId) {
        return {
          success: false,
          error: "Semestre inválido para a disciplina selecionada.",
        };
      }
    } else if (semesterId) {
      const semester = await prisma.semester.findFirst({
        where: {
          id: semesterId,
          userId: session.user.id,
        },
      });

      if (!semester) {
        return {
          success: false,
          error: "Semestre inválido ou não autorizado.",
        };
      }
    }

    const controller = new CreateEnrollmentController();
    const enrollmentData: CreateEnrollmentDto = {
      ...formData,
      userId: session.user.id,
    };
    const enrollment = await controller.create(enrollmentData);

    return { success: true, data: enrollment };
  } catch {
    return {
      success: false,
      error: "Não foi possível criar a matrícula no momento.",
    };
  }
}

export async function updateEnrollmentAction(
  formData: UpdateEnrollmentDto,
): Promise<EnrollmentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const controller = new UpdateEnrollmentController();
    const payload = {
      ...formData,
      userId: session.user.id,
    };
    const enrollment = await controller.update(payload);

    return { success: true, data: enrollment };
  } catch {
    return {
      success: false,
      error: "Não foi possível atualizar a matrícula no momento.",
    };
  }
}

export async function deleteEnrollmentAction(
  formData: DeleteEnrollmentDto,
): Promise<DeleteEnrollmentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const controller = new DeleteEnrollmentController();
    const deletePayload = { ...formData, userId: session.user.id };
    await controller.delete(deletePayload);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir a matrícula no momento.",
    };
  }
}
