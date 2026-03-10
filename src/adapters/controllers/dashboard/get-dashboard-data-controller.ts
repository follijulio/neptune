import { GetDashboardDataService } from "../../services/dashboard/get-dashboard-data-service";

import { DashboardFiltersDto } from "@/src/domain/dashboard.dto";
import { DashboardFiltersSchema } from "@/src/schemas/dashboard-schema";

export class GetDashboardDataController {
  async get(filters: DashboardFiltersDto) {
    try {
      const validatedFilters = DashboardFiltersSchema.parse(filters);
      const service = new GetDashboardDataService();

      return await service.execute(validatedFilters);
    } catch (error) {
      throw new Error("Erro ao carregar dados do dashboard", { cause: error });
    }
  }
}
