"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { GetDashboardDataController } from "@/src/adapters/controllers/dashboard/get-dashboard-data-controller";
import { auth } from "@/src/auth";
import {
  DashboardDataResponse,
  DashboardFiltersDto,
} from "@/src/domain/dashboard.dto";

export async function getDashboardDataAction(
  filters: DashboardFiltersDto,
): Promise<DashboardDataResponse> {
  try {
    const controller = new GetDashboardDataController();
    const data = await controller.get(filters);

    const normalizedData = {
      ...data,
      semestersTable: data.semestersTable.map((semester, semesterIndex) => {
        const semesterWithOptionalId = semester as typeof semester & {
          id?: string;
        };

        return {
          ...semester,
          id:
            semesterWithOptionalId.id ??
            `${semester.semester}-${semesterIndex}`,
          data: semester.data.map((subject, subjectIndex) => {
            const subjectWithOptionalId = subject as typeof subject & {
              id?: string;
            };

            return {
              ...subject,
              id:
                subjectWithOptionalId.id ??
                `${semester.semester}-${semesterIndex}-${subjectIndex}`,
              status: String(subject.status),
            };
          }),
        };
      }),
    };

    return { success: true, data: normalizedData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function skipOnboardingAction(totalHours: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autenticado" };
  }

  try {
    const existingWorkload = await prisma.workload.findFirst({
      where: { userId: session.user.id, category: "Obrigatórias" },
    });

    if (!existingWorkload) {
      await prisma.workload.create({
        data: {
          userId: session.user.id,
          category: "Obrigatórias",
          totalHours: totalHours,
          completedHours: 0,
        },
      });
    }
  } catch (error) {
    console.error("Erro ao pular onboarding:", error);
  }

  redirect("/dashboard");
}
