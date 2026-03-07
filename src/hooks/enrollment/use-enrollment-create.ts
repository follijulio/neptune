import { createEnrollmentAction } from "@/src/app/actions/enrollment-actions";
import { CreateEnrollmentDto, EnrollmentResponse } from "@/src/domain/enrollment.dto";
import { useState } from "react";

export function useEnrollmentCreate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    enrollmentData: CreateEnrollmentDto
  ): Promise<EnrollmentResponse> => {
    setIsLoading(true);
    try {
      return await createEnrollmentAction(enrollmentData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}