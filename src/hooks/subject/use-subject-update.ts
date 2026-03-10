import { useState } from "react";

import { updateSubjectAction } from "@/src/app/actions/subject-actions";
import { SubjectResponse, UpdateSubjectDto } from "@/src/domain/subject.dto";

export function useSubjectUpdate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    subjectData: UpdateSubjectDto,
  ): Promise<SubjectResponse> => {
    setIsLoading(true);
    try {
      return await updateSubjectAction(subjectData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
