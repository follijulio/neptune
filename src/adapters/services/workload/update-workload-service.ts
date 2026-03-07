import { prisma } from "@/lib/prisma";
import { UpdateWorkloadDto } from "@/src/domain/workload.dto";

export class UpdateWorkloadService {
  async update({ id, ...data }: UpdateWorkloadDto) {
    return await prisma.workload.update({
      where: { id },
      data,
      select: {
        id: true,
        category: true,
        totalHours: true,
        completedHours: true,
        userId: true,
      },
    });
  }
}