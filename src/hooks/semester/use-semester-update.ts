import { useState } from "react";

import { updateSemesterAction } from "@/src/app/actions/semester-actions";
import { SemesterResponse, UpdateSemesterDto } from "@/src/domain/semester.dto";

export function useSemesterUpdate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    semesterData: UpdateSemesterDto,
  ): Promise<SemesterResponse> => {
    setIsLoading(true);
    try {
      return await updateSemesterAction(semesterData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
