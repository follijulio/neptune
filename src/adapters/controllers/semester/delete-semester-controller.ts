import { DeleteSemesterService } from "../../services/semester/delete-semester-service";

import { DeleteSemesterDto } from "@/src/domain/semester.dto";
import { DeleteSemesterSchema } from "@/src/schemas/semester-schema";

export class DeleteSemesterController {
  async delete(semesterData: DeleteSemesterDto) {
    try {
      const validatedData = DeleteSemesterSchema.parse(semesterData);
      const service = new DeleteSemesterService();

      return await service.delete(validatedData);
    } catch (error) {
      throw new Error("Erro ao deletar semestre", { cause: error });
    }
  }
}
