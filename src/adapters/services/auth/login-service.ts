import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { prisma } from "@/prisma/lib/prisma";
import { LoginUserDto, LoginUserResponse } from "@/src/domain/user.dto";

export class LoginService {
  async execute(credentials: LoginUserDto): Promise<LoginUserResponse> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) throw new Error("E-mail ou senha inválidos");

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash || "",
    );

    if (!isPasswordValid) throw new Error("E-mail ou senha inválidos");

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    return {
      token,
      user: { id: user.id, name: user.name },
    };
  }
}
