import { DeleteEnrollmentDto } from "@/src/domain/enrollment.dto";
import { DeleteEnrollmentSchema } from "@/src/schemas/enrollment-schema";
import { DeleteEnrollmentService } from "../../services/enrollment/delete-enrollment-service";

export class DeleteEnrollmentController {
  async delete(enrollmentData: DeleteEnrollmentDto) {
    try {
      const validatedData = DeleteEnrollmentSchema.parse(enrollmentData);
      const service = new DeleteEnrollmentService();
      
      return await service.delete(validatedData);
    } catch (error) {
      throw new Error("Erro ao deletar matrícula", { cause: error });
    }
  }
}