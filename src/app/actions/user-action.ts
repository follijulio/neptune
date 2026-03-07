"use server";

import { CreateUserController } from "@/src/adapters/controllers/user/create-user-controller";
import { DeleteUserController } from "@/src/adapters/controllers/user/delete-user-delete";
import { UpdateUserController } from "@/src/adapters/controllers/user/update-user-controller";
import {
  createUserDto,
  DeleteUserDto,
  DeleteUserResponse,
  RegisterUserResponse,
  UpdateUserDto,
  UpdateUserResponse,
} from "@/src/domain/user.dto";

export async function updateUserAction(
  formData: UpdateUserDto,
): Promise<UpdateUserResponse> {
  try {
    const controller = new UpdateUserController();
    const user = await controller.update(formData);

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
export async function registerUserAction(
  formData: createUserDto,
): Promise<RegisterUserResponse> {
  try {
    const controller = new CreateUserController();
    const user = await controller.create(formData);
    return { success: true, data: user };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function deleteUserAction(
  formData: DeleteUserDto,
): Promise<DeleteUserResponse> {
  try {
    const controller = new DeleteUserController();
    await controller.delete(formData);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
