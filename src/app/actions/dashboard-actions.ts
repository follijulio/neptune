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
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    const safeFilters: DashboardFiltersDto = {
      userId: session.user.id,
      semester:
        typeof filters?.semester === "string" ? filters.semester : undefined,
      filterCurriculum:
        typeof filters?.filterCurriculum === "string"
          ? filters.filterCurriculum
          : undefined,
    };

    const controller = new GetDashboardDataController();
    const data = await controller.get(safeFilters);

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
  } catch {
    return {
      success: false,
      error: "Não foi possível carregar os dados do painel.",
    };
  }
}

export async function skipOnboardingAction(totalHours: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  if (
    typeof totalHours !== "number" ||
    isNaN(totalHours) ||
    totalHours <= 0 ||
    totalHours > 50000
  ) {
    return { error: "Carga horária inválida." };
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
          totalHours: Math.floor(totalHours),
          completedHours: 0,
        },
      });
    }
  } catch {
    return { error: "Erro ao processar a configuração inicial." };
  }

  redirect("/dashboard");
}
