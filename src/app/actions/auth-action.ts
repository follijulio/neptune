"use server";

import { CreateUserController } from "@/src/adapters/controllers/user/create-user";

import { createUserDto, RegisterUserResponse } from "@/src/domain/user.dto";

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
