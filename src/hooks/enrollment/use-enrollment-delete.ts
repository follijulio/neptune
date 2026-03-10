import { useState } from "react";

import { deleteEnrollmentAction } from "@/src/app/actions/enrollment-actions";
import {
  DeleteEnrollmentDto,
  DeleteEnrollmentResponse,
} from "@/src/domain/enrollment.dto";

export function useEnrollmentDelete() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    enrollmentData: DeleteEnrollmentDto,
  ): Promise<DeleteEnrollmentResponse> => {
    setIsLoading(true);
    try {
      return await deleteEnrollmentAction(enrollmentData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
