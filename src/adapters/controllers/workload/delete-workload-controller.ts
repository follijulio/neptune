import { DeleteWorkloadService } from "../../services/workload/delete-workload-service";

import { DeleteWorkloadDto } from "@/src/domain/workload.dto";
import { DeleteWorkloadSchema } from "@/src/schemas/workload-schema";

export class DeleteWorkloadController {
  async delete(workloadData: DeleteWorkloadDto) {
    try {
      const validatedData = DeleteWorkloadSchema.parse(workloadData);
      const service = new DeleteWorkloadService();

      return await service.delete(validatedData);
    } catch (error) {
      throw new Error("Erro ao deletar carga horária", { cause: error });
    }
  }
}
