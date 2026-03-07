import { prisma } from "@/prisma/lib/prisma";
import { DeleteSubjectDto } from "@/src/domain/subject.dto";

export class DeleteSubjectService {
  async delete({ id }: DeleteSubjectDto) {
    return await prisma.subject.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}
