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

    const controller = new CreateEnrollmentController();
    const enrollment = await controller.create(formData);

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
    const enrollment = await controller.update(formData);

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
    await controller.delete(formData);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir a matrícula no momento.",
    };
  }
}
