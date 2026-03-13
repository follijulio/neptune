"use server";

import { CreateWorkloadController } from "@/src/adapters/controllers/workload/create-workload-controller";
import { DeleteWorkloadController } from "@/src/adapters/controllers/workload/delete-workload-controller";
import { UpdateWorkloadController } from "@/src/adapters/controllers/workload/update-workload-controller";
import { auth } from "@/src/auth";
import {
  CreateWorkloadDto,
  DeleteWorkloadDto,
  DeleteWorkloadResponse,
  UpdateWorkloadDto,
  WorkloadResponse,
} from "@/src/domain/workload.dto";

export async function createWorkloadAction(
  formData: CreateWorkloadDto,
): Promise<WorkloadResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const dtoUserId = "userId" in formData ? formData.userId : undefined;
    if (typeof dtoUserId === "string" && dtoUserId !== session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    const controller = new CreateWorkloadController();
    const workload = await controller.create(formData);

    return { success: true, data: workload };
  } catch {
    return {
      success: false,
      error: "Não foi possível criar a carga horária no momento.",
    };
  }
}

export async function updateWorkloadAction(
  formData: UpdateWorkloadDto,
): Promise<WorkloadResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const dtoUserId = "userId" in formData ? formData.userId : undefined;
    if (typeof dtoUserId === "string" && dtoUserId !== session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    // Garanta que a atualização sempre esteja vinculada ao usuário autenticado
    (formData as any).userId = session.user.id;

    const controller = new UpdateWorkloadController();
    const workload = await controller.update(formData);

    return { success: true, data: workload };
  } catch {
    return {
      success: false,
      error: "Não foi possível atualizar a carga horária no momento.",
    };
  }
}

export async function deleteWorkloadAction(
  formData: DeleteWorkloadDto,
): Promise<DeleteWorkloadResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const dtoUserId = "userId" in formData ? formData.userId : undefined;
    if (typeof dtoUserId === "string" && dtoUserId !== session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    const controller = new DeleteWorkloadController();
    await controller.delete(formData);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir a carga horária no momento.",
    };
  }
}
