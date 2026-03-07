"use server";

import { CreateWorkloadController } from "@/src/adapters/controllers/workload/create-workload-controller";
import { CreateWorkloadDto, WorkloadResponse } from "@/src/domain/workload.dto";
import { UpdateWorkloadController } from "@/src/adapters/controllers/workload/update-workload-controller";
import { UpdateWorkloadDto } from "@/src/domain/workload.dto";
import { DeleteWorkloadController } from "@/src/adapters/controllers/workload/delete-workload-controller";
import {
  DeleteWorkloadDto,
  DeleteWorkloadResponse,
} from "@/src/domain/workload.dto";

export async function createWorkloadAction(
  formData: CreateWorkloadDto,
): Promise<WorkloadResponse> {
  try {
    const controller = new CreateWorkloadController();
    const workload = await controller.create(formData);

    return { success: true, data: workload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updateWorkloadAction(
  formData: UpdateWorkloadDto,
): Promise<WorkloadResponse> {
  try {
    const controller = new UpdateWorkloadController();
    const workload = await controller.update(formData);

    return { success: true, data: workload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function deleteWorkloadAction(
  formData: DeleteWorkloadDto,
): Promise<DeleteWorkloadResponse> {
  try {
    const controller = new DeleteWorkloadController();
    await controller.delete(formData);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
