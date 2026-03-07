"use server";

import { LoginController } from "@/src/adapters/controllers/auth/login-controller";

import {
  AuthResponse,
  LoginUserDto,
} from "@/src/domain/user.dto";
import { cookies } from "next/headers";



export async function loginAction(
  formData: LoginUserDto,
): Promise<AuthResponse> {
  try {
    const controller = new LoginController();
    const { token, user } = await controller.handle(formData);
    const cookieStore = await cookies();
    cookieStore.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha na autenticação",
    };
  }
}
