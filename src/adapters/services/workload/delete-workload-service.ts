import { prisma } from "@/prisma/lib/prisma";
import { DeleteWorkloadDto } from "@/src/domain/workload.dto";

export class DeleteWorkloadService {
  async delete({ id, userId }: DeleteWorkloadDto) {
    return await prisma.workload.deleteMany({
      where: { id, userId },
    });
  }
}
