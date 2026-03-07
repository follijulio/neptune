import { getDashboardDataAction } from "@/src/app/actions/dashboard-actions";
import {
  DashboardDataResponse,
  DashboardFiltersDto,
} from "@/src/domain/dashboard.dto";
import { useCallback, useState } from "react";

export function useDashboardData() {
  const [data, setData] = useState<DashboardDataResponse["data"] | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (filters: DashboardFiltersDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDashboardDataAction(filters);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Erro ao carregar os dados do dashboard");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute };
}
