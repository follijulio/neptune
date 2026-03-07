import { deleteWorkloadAction } from "@/src/app/actions/workload-actions";
import {
  DeleteWorkloadDto,
  DeleteWorkloadResponse,
} from "@/src/domain/workload.dto";
import { useState } from "react";

export function useWorkloadDelete() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    workloadData: DeleteWorkloadDto,
  ): Promise<DeleteWorkloadResponse> => {
    setIsLoading(true);
    try {
      return await deleteWorkloadAction(workloadData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
