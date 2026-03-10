"use server";

import { CreateSemesterController } from "@/src/adapters/controllers/semester/create-semester-controller";
import { DeleteSemesterController } from "@/src/adapters/controllers/semester/delete-semester-controller";
import { UpdateSemesterController } from "@/src/adapters/controllers/semester/update-semester-controller";
import {
  CreateSemesterDto,
  SemesterResponse,
  UpdateSemesterDto,
} from "@/src/domain/semester.dto";
import {
  DeleteSemesterDto,
  DeleteSemesterResponse,
} from "@/src/domain/semester.dto";

export async function createSemesterAction(
  formData: CreateSemesterDto,
): Promise<SemesterResponse> {
  try {
    const controller = new CreateSemesterController();
    const semester = await controller.create(formData);

    return { success: true, data: semester };
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

    return { success: true, data: semester };
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
