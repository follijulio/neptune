import bcrypt from "bcryptjs";

import { prisma } from "@/prisma/lib/prisma";
import { createUserDto } from "@/src/domain/user.dto";

export class CreateUserService {
  async create(user: createUserDto) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        username: user.userName,
        passwordHash: hashedPassword,
      },
      select: { id: true, email: true },
    });
  }
}
