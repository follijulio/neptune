import { DeleteWorkloadDto } from "@/src/domain/workload.dto";
import { DeleteWorkloadSchema } from "@/src/schemas/workload-schema";
import { DeleteWorkloadService } from "../../services/workload/delete-workload-service";

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
