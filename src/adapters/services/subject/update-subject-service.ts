import { prisma } from "@/prisma/lib/prisma";
import { UpdateSubjectDto } from "@/src/domain/subject.dto";

export class UpdateSubjectService {
  async update({ id, ...data }: UpdateSubjectDto) {
    return await prisma.subject.update({
      where: { id },
      data,
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }
}
