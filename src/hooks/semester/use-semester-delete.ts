import { deleteSemesterAction } from "@/src/app/actions/semester-actions";
import {
  DeleteSemesterDto,
  DeleteSemesterResponse,
} from "@/src/domain/semester.dto";
import { useState } from "react";

export function useSemesterDelete() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    semesterData: DeleteSemesterDto,
  ): Promise<DeleteSemesterResponse> => {
    setIsLoading(true);
    try {
      return await deleteSemesterAction(semesterData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
