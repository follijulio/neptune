import { CreateEnrollmentDto } from "@/src/domain/enrollment.dto";
import { CreateEnrollmentSchema } from "@/src/schemas/enrollment-schema";
import { CreateEnrollmentService } from "../../services/enrollment/create-enrollment-service";

export class CreateEnrollmentController {
  async create(enrollmentData: CreateEnrollmentDto) {
    try {
      const validatedData = CreateEnrollmentSchema.parse(enrollmentData);
      const service = new CreateEnrollmentService();
      
      return await service.create(validatedData);
    } catch (error) {
      throw new Error("Erro ao criar matrícula", { cause: error });
    }
  }
}