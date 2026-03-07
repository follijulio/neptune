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
  user: { id: string; email: string };
}