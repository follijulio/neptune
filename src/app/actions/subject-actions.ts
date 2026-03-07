"use server";

import { CreateSubjectController } from "@/src/adapters/controllers/subject/create-subject-controller";
import { CreateSubjectDto, SubjectResponse } from "@/src/domain/subject.dto";

export async function createSubjectAction(
  formData: CreateSubjectDto
): Promise<SubjectResponse> {
  try {
    const controller = new CreateSubjectController();
    const subject = await controller.create(formData);

    return { success: true, data: subject };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}