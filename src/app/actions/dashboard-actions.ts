"use server";

import { prisma } from "@/prisma/lib/prisma";
import { GetDashboardDataController } from "@/src/adapters/controllers/dashboard/get-dashboard-data-controller";
import { auth } from "@/src/auth";
import {
  DashboardDataResponse,
  DashboardFiltersDto,
} from "@/src/domain/dashboard.dto";
import { redirect } from "next/navigation";

export async function getDashboardDataAction(
  filters: DashboardFiltersDto,
): Promise<DashboardDataResponse> {
  try {
    const controller = new GetDashboardDataController();
    const data = await controller.get(filters);

    return { success: true, data };
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
