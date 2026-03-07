import { prisma } from "@/prisma/lib/prisma";
import { CreateEnrollmentDto } from "@/src/domain/enrollment.dto";

export class CreateEnrollmentService {
  async create(data: CreateEnrollmentDto) {
    return await prisma.enrollment.create({
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
