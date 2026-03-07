import { prisma } from "@/lib/prisma";
import { UpdateEnrollmentDto } from "@/src/domain/enrollment.dto";

export class UpdateEnrollmentService {
  async update({ id, ...data }: UpdateEnrollmentDto) {
    return await prisma.enrollment.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        grade: true,
        absences: true,
        maxAbsences: true,
        userId: true,
        subjectId: true,
        semesterId: true,
      },
    });
  }
}