import { prisma } from "@/prisma/lib/prisma";
import { CreateWorkloadDto } from "@/src/domain/workload.dto";

export class CreateWorkloadService {
  async create(data: CreateWorkloadDto) {
    return await prisma.workload.create({
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
