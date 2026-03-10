import { CreateSubjectDto } from "@/src/domain/subject.dto";
import { CreateSubjectSchema } from "@/src/schemas/subject-schema";
import { CreateSubjectService } from "../../services/subject/create-subject-service";

export class CreateSubjectController {
  async create(subjectData: CreateSubjectDto) {
    try {
      const validatedData = CreateSubjectSchema.parse(subjectData);
      const service = new CreateSubjectService();

      return await service.create(validatedData);
    } catch (error) {
      throw new Error("Erro ao criar disciplina", { cause: error });
    }
  }
}
