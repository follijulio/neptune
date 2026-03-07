"use server";

import { GetDashboardDataController } from "@/src/adapters/controllers/dashboard/get-dashboard-data-controller";
import {
  DashboardFiltersDto,
  DashboardDataResponse,
} from "@/src/domain/dashboard.dto";

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
