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