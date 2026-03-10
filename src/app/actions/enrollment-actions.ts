"use server";

import { CreateEnrollmentController } from "@/src/adapters/controllers/enrollment/create-enrollment-controller";
import { DeleteEnrollmentController } from "@/src/adapters/controllers/enrollment/delete-enrollment-controller";
import { UpdateEnrollmentController } from "@/src/adapters/controllers/enrollment/update-enrollment-controller";
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
    const controller = new CreateEnrollmentController();
    const enrollment = await controller.create(formData);

    return { success: true, data: enrollment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updateEnrollmentAction(
  formData: UpdateEnrollmentDto,
): Promise<EnrollmentResponse> {
  try {
    const controller = new UpdateEnrollmentController();
    const enrollment = await controller.update(formData);

    return { success: true, data: enrollment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function deleteEnrollmentAction(
  formData: DeleteEnrollmentDto,
): Promise<DeleteEnrollmentResponse> {
  try {
    const controller = new DeleteEnrollmentController();
    await controller.delete(formData);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
