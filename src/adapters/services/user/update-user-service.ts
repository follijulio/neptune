import bcrypt from "bcryptjs";

import { prisma } from "@/prisma/lib/prisma";
import { UpdateUserDto } from "@/src/domain/user.dto";

type UpdateUserData = Omit<UpdateUserDto, "id" | "password"> & {
  passwordHash?: string;
};

export class UpdateUserService {
  async update(userParams: UpdateUserDto) {
    const { id, password, ...restData } = userParams;
    const dataToUpdate: UpdateUserData = { ...restData };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
    }

    return await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}
