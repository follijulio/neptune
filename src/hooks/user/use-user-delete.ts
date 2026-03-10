import { useState } from "react";

import { deleteUserAction } from "@/src/app/actions/user-action";
import { DeleteUserDto, DeleteUserResponse } from "@/src/domain/user.dto";

export function useUserDelete() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    userData: DeleteUserDto,
  ): Promise<DeleteUserResponse> => {
    setIsLoading(true);
    try {
      return await deleteUserAction(userData);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
