import { createSemesterAction } from "@/src/app/actions/semester-actions";
import { CreateSemesterDto, SemesterResponse } from "@/src/domain/semester.dto";
import { useState } from "react";

export function useSemesterCreate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    semesterData: CreateSemesterDto,
  ): Promise<SemesterResponse> => {
    setIsLoading(true);
    try {
      return await createSemesterAction(semesterData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
