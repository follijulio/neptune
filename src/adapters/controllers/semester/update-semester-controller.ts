import { UpdateSemesterDto } from "@/src/domain/semester.dto";
import { UpdateSemesterSchema } from "@/src/schemas/semester-schema";
import { UpdateSemesterService } from "../../services/semester/update-semester-service";

export class UpdateSemesterController {
  async update(semesterData: UpdateSemesterDto) {
    try {
      const validatedData = UpdateSemesterSchema.parse(semesterData);
      const service = new UpdateSemesterService();

      return await service.update(validatedData);
    } catch (error) {
      throw new Error("Erro ao atualizar semestre", { cause: error });
    }
  }
}
