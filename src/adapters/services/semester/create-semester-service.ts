import { prisma } from "@/prisma/lib/prisma";
import { CreateSemesterDto } from "@/src/domain/semester.dto";

export class CreateSemesterService {
  async create(data: CreateSemesterDto) {
    return await prisma.semester.create({
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
