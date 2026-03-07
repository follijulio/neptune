import { useState } from "react";
import { registerUserAction } from "../../app/actions/auth-action";
import { createUserDto, RegisterUserResponse } from "../../domain/user.dto";

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
