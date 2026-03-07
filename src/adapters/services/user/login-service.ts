import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export class LoginService {
  async execute(credentials: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) throw new Error("Credenciais inválidas");

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );

    if (!isPasswordValid) throw new Error("Credenciais inválidas");

    const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    return { token, user: { id: user.id, email: user.email } };
  }
}
