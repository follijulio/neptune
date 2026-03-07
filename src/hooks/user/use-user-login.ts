import { loginAction } from "@/src/app/actions/auth-action";
import { AuthResponse, LoginUserDto } from "@/src/domain/user.dto";
import { useState } from "react";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginUserDto): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const result = await loginAction(credentials);

      if (result.success) {
        window.location.href = "/";
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
