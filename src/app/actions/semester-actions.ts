"use server";

import { CreateSemesterController } from "@/src/adapters/controllers/semester/create-semester-controller";
import { DeleteSemesterController } from "@/src/adapters/controllers/semester/delete-semester-controller";
import { UpdateSemesterController } from "@/src/adapters/controllers/semester/update-semester-controller";
import {
  CreateSemesterDto,
  DeleteSemesterDto,
  DeleteSemesterResponse,
  SemesterResponse,
  UpdateSemesterDto,
} from "@/src/domain/semester.dto";

export async function createSemesterAction(
  formData: CreateSemesterDto,
): Promise<SemesterResponse> {
  try {
    const controller = new CreateSemesterController();
    const semester = await controller.create(formData);

    return {
      success: true,
      data: {
        id: semester.id,
        period: semester.title,
        status: semester.isCurrent ? "CURRENT" : "INACTIVE",
        yieldCoefficient: null,
        userId: semester.userId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updateSemesterAction(
  formData: UpdateSemesterDto,
): Promise<SemesterResponse> {
  try {
    const controller = new UpdateSemesterController();
    const semester = await controller.update(formData);

    return {
      success: true,
      data: {
        id: semester.id,
        period: semester.title,
        status: semester.isCurrent ? "CURRENT" : "INACTIVE",
        yieldCoefficient: null,
        userId: semester.userId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function deleteSemesterAction(
  formData: DeleteSemesterDto,
): Promise<DeleteSemesterResponse> {
  try {
    const controller = new DeleteSemesterController();
    await controller.delete(formData);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
