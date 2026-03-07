import { createSubjectAction } from "@/src/app/actions/subject-actions";
import { CreateSubjectDto, SubjectResponse } from "@/src/domain/subject.dto";
import { useState } from "react";

export function useSubjectCreate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    subjectData: CreateSubjectDto,
  ): Promise<SubjectResponse> => {
    setIsLoading(true);
    try {
      return await createSubjectAction(subjectData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
