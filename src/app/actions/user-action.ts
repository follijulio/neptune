"use server";

import { CreateUserController } from "@/src/adapters/controllers/user/create-user-controller";
import { DeleteUserController } from "@/src/adapters/controllers/user/delete-user-delete";
import { UpdateUserController } from "@/src/adapters/controllers/user/update-user-controller";
import { auth } from "@/src/auth";
import {
  createUserDto,
  DeleteUserDto,
  DeleteUserResponse,
  RegisterUserResponse,
  UpdateUserDto,
  UpdateUserResponse,
} from "@/src/domain/user.dto";

type UserIdCarrier = {
  id?: string;
  userId?: string;
};

function getDtoId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const dto = data as UserIdCarrier;
  return dto.id ?? dto.userId;
}

export async function updateUserAction(
  formData: UpdateUserDto,
): Promise<UpdateUserResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const dtoId = getDtoId(formData);
    if (dtoId && dtoId !== session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    const controller = new UpdateUserController();
    const user = await controller.update(formData);

    return { success: true, data: user };
  } catch {
    return {
      success: false,
      error: "Não foi possível atualizar o usuário no momento.",
    };
  }
}

export async function registerUserAction(
  formData: createUserDto,
): Promise<RegisterUserResponse> {
  try {
    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const controller = new CreateUserController();
    const user = await controller.create(formData);

    return { success: true, data: user };
  } catch {
    return {
      success: false,
      error: "Não foi possível registrar o usuário no momento.",
    };
  }
}

export async function deleteUserAction(
  formData: DeleteUserDto,
): Promise<DeleteUserResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Dados inválidos." };
    }

    const dtoId = getDtoId(formData);
    if (dtoId && dtoId !== session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    const controller = new DeleteUserController();
    await controller.delete(formData);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir o usuário no momento.",
    };
  }
}
