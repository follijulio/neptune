import { useState } from "react";

import { updateEnrollmentAction } from "../../app/actions/enrollment-actions";
import {
  EnrollmentResponse,
  UpdateEnrollmentDto,
} from "../../domain/enrollment.dto";

export function useEnrollmentUpdate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    enrollmentData: UpdateEnrollmentDto,
  ): Promise<EnrollmentResponse> => {
    setIsLoading(true);
    try {
      return await updateEnrollmentAction(enrollmentData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
