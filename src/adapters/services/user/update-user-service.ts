import { prisma } from "@/lib/prisma";
import { UpdateUserDto } from "@/src/domain/user.dto";
import bcrypt from "bcryptjs";

export class UpdateUserService {
  async update(userParams: UpdateUserDto) {
    const { id, password, ...restData } = userParams;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = { ...restData };

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
