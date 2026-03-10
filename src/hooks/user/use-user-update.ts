import { updateUserAction } from "@/src/app/actions/user-action";
import { UpdateUserDto, UpdateUserResponse } from "@/src/domain/user.dto";
import { useState } from "react";

export function useUserUpdate() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    userData: UpdateUserDto,
  ): Promise<UpdateUserResponse> => {
    setIsLoading(true);
    try {
      return await updateUserAction(userData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
