import { updateEnrollmentAction } from "@/src/adapters/controllers/enrollment/update-enrollment-controller";
import {
  EnrollmentResponse,
  UpdateEnrollmentDto,
} from "@/src/domain/enrollment.dto";
import { useState } from "react";

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
