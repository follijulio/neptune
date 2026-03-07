export interface createUserDto {
  name: string;
  profileImageUrl: string;
  password: string;
  email: string;
  userName: string;
}

export interface RegisterUserResponse {
  success: boolean;
  data?: { id: string; email: string };
  error?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  token: string;
  user: { id: string; name: string };
}

export interface AuthResponse {
  success: boolean;
  data?: { id: string; name: string };
  error?: string;
}

export interface UpdateUserDto {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string | null;
  };
  error?: string;
}
