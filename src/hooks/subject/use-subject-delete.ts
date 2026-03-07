import { deleteSubjectAction } from "@/src/app/actions/subject-actions";
import {
  DeleteSubjectDto,
  DeleteSubjectResponse,
} from "@/src/domain/subject.dto";
import { useState } from "react";

export function useSubjectDelete() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    subjectData: DeleteSubjectDto,
  ): Promise<DeleteSubjectResponse> => {
    setIsLoading(true);
    try {
      return await deleteSubjectAction(subjectData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
