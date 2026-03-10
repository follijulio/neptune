import { CreateSemesterService } from "../../services/semester/create-semester-service";

import { CreateSemesterDto } from "@/src/domain/semester.dto";
import { CreateSemesterSchema } from "@/src/schemas/semester-schema";

export class CreateSemesterController {
  async create(semesterData: CreateSemesterDto) {
    try {
      const validatedData = CreateSemesterSchema.parse(semesterData);
      const service = new CreateSemesterService();

      return await service.create(validatedData);
    } catch (error) {
      throw new Error("Erro ao criar semestre", { cause: error });
    }
  }
}
