import { prisma } from "@/lib/prisma";
import { DeleteEnrollmentDto } from "@/src/domain/enrollment.dto";

export class DeleteEnrollmentService {
  async delete({ id }: DeleteEnrollmentDto) {
    return await prisma.enrollment.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}