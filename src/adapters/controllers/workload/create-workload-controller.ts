import { CreateWorkloadService } from "../../services/workload/create-workload-service";

import { CreateWorkloadDto } from "@/src/domain/workload.dto";
import { CreateWorkloadSchema } from "@/src/schemas/workload-schema";

export class CreateWorkloadController {
  async create(workloadData: CreateWorkloadDto) {
    try {
      const validatedData = CreateWorkloadSchema.parse(workloadData);
      const service = new CreateWorkloadService();

      return await service.create(validatedData);
    } catch (error) {
      throw new Error("Erro ao criar carga horária", { cause: error });
    }
  }
}
