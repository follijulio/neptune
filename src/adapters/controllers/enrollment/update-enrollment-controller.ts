import {
  EnrollmentResponse,
  UpdateEnrollmentDto,
} from "@/src/domain/enrollment.dto";
import { UpdateEnrollmentSchema } from "@/src/schemas/enrollment-schema";
import { UpdateEnrollmentService } from "../../services/enrollment/update-enrollment-service";

export class UpdateEnrollmentController {
  async update(enrollmentData: UpdateEnrollmentDto) {
    try {
      const validatedData = UpdateEnrollmentSchema.parse(enrollmentData);
      const service = new UpdateEnrollmentService();

      return await service.update(validatedData);
    } catch (error) {
      throw new Error("Erro ao atualizar matrícula", { cause: error });
    }
  }
}

export async function updateEnrollmentAction(
  formData: UpdateEnrollmentDto,
): Promise<EnrollmentResponse> {
  try {
    const controller = new UpdateEnrollmentController();
    const enrollment = await controller.update(formData);

    return { success: true, data: enrollment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
