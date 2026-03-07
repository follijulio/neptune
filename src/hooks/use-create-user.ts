import { useState } from "react";
import { registerUserAction } from "../app/actions/user-actions";
import { createUserDto, RegisterUserResponse } from "../domain/user.dto";

export function useUserCreate() {
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
