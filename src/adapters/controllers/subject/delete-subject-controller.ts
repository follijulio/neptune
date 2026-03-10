import { DeleteSubjectService } from "../../services/subject/delete-subject-service";

import { DeleteSubjectDto } from "@/src/domain/subject.dto";
import { DeleteSubjectSchema } from "@/src/schemas/subject-schema";

export class DeleteSubjectController {
  async delete(subjectData: DeleteSubjectDto) {
    try {
      const validatedData = DeleteSubjectSchema.parse(subjectData);
      const service = new DeleteSubjectService();

      return await service.delete(validatedData);
    } catch (error) {
      throw new Error("Erro ao deletar disciplina", { cause: error });
    }
  }
}
