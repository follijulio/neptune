import { useState } from "react";

import { createWorkloadAction } from "@/src/app/actions/workload-actions";
import { CreateWorkloadDto, WorkloadResponse } from "@/src/domain/workload.dto";

export function useWorkloadCreate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    workloadData: CreateWorkloadDto,
  ): Promise<WorkloadResponse> => {
    setIsLoading(true);
    try {
      return await createWorkloadAction(workloadData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
