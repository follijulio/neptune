import { updateWorkloadAction } from "@/src/app/actions/workload-actions";
import { UpdateWorkloadDto, WorkloadResponse } from "@/src/domain/workload.dto";
import { useState } from "react";

export function useWorkloadUpdate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    workloadData: UpdateWorkloadDto,
  ): Promise<WorkloadResponse> => {
    setIsLoading(true);
    try {
      return await updateWorkloadAction(workloadData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
