import { prisma } from "@/prisma/lib/prisma";
import { UpdateSemesterDto } from "@/src/domain/semester.dto";

export class UpdateSemesterService {
  async update({ id, ...data }: UpdateSemesterDto) {
    return await prisma.semester.update({
      where: { id },
      data,
      select: {
        id: true,
        period: true,
        status: true,
        yieldCoefficient: true,
        userId: true,
      },
    });
  }
}
