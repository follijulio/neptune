import { prisma } from "@/lib/prisma";
import { DeleteWorkloadDto } from "@/src/domain/workload.dto";

export class DeleteWorkloadService {
  async delete({ id }: DeleteWorkloadDto) {
    return await prisma.workload.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}