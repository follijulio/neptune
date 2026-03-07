import { prisma } from "@/lib/prisma";
import { DeleteUserDto } from "@/src/domain/user.dto";

export class DeleteUserService {
  async delete({ id }: DeleteUserDto) {
    return await prisma.user.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}