import { prisma } from "@/prisma/lib/prisma";
import { CreateSubjectDto } from "@/src/domain/subject.dto";

export class CreateSubjectService {
  async create(data: CreateSubjectDto) {
    return await prisma.subject.create({
      data,
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }
}
