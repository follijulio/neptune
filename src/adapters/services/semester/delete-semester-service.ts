import { prisma } from "@/lib/prisma";
import { DeleteSemesterDto } from "@/src/domain/semester.dto";

export class DeleteSemesterService {
  async delete({ id }: DeleteSemesterDto) {
    return await prisma.semester.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}