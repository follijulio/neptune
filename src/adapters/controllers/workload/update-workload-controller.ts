import { UpdateWorkloadDto } from "@/src/domain/workload.dto";
import { UpdateWorkloadSchema } from "@/src/schemas/workload-schema";
import { UpdateWorkloadService } from "../../services/workload/update-workload-service";

export class UpdateWorkloadController {
  async update(workloadData: UpdateWorkloadDto) {
    try {
      const validatedData = UpdateWorkloadSchema.parse(workloadData);
      const service = new UpdateWorkloadService();
      
      return await service.update(validatedData);
    } catch (error) {
      throw new Error("Erro ao atualizar carga horária", { cause: error });
    }
  }
}