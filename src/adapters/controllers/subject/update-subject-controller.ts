import { UpdateSubjectDto } from "@/src/domain/subject.dto";
import { UpdateSubjectSchema } from "@/src/schemas/subject-schema";
import { UpdateSubjectService } from "../../services/subject/update-subject-service";

export class UpdateSubjectController {
  async update(subjectData: UpdateSubjectDto) {
    try {
      const validatedData = UpdateSubjectSchema.parse(subjectData);
      const service = new UpdateSubjectService();

      return await service.update(validatedData);
    } catch (error) {
      throw new Error("Erro ao atualizar disciplina", { cause: error });
    }
  }
}
