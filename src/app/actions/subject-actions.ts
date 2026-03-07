"use server";

import { CreateSubjectController } from "@/src/adapters/controllers/subject/create-subject-controller";
import { UpdateSubjectController } from "@/src/adapters/controllers/subject/update-subject-controller";
import { UpdateSubjectDto } from "@/src/domain/subject.dto";
import { CreateSubjectDto, SubjectResponse } from "@/src/domain/subject.dto";

import { DeleteSubjectController } from "@/src/adapters/controllers/subject/delete-subject-controller";
import {
  DeleteSubjectDto,
  DeleteSubjectResponse,
} from "@/src/domain/subject.dto";

export async function createSubjectAction(
  formData: CreateSubjectDto,
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

export async function updateSubjectAction(
  formData: UpdateSubjectDto,
): Promise<SubjectResponse> {
  try {
    const controller = new UpdateSubjectController();
    const subject = await controller.update(formData);

    return { success: true, data: subject };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function deleteSubjectAction(
  formData: DeleteSubjectDto,
): Promise<DeleteSubjectResponse> {
  try {
    const controller = new DeleteSubjectController();
    await controller.delete(formData);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
