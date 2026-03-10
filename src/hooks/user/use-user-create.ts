import { useState } from "react";

import { createUserDto, RegisterUserResponse } from "../../domain/user.dto";

import { registerUserAction } from "@/src/app/actions/user-action";

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    user: createUserDto,
  ): Promise<RegisterUserResponse> => {
    setIsLoading(true);
    try {
      const result = await registerUserAction(user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
