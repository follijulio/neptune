import { LoginService } from "../../services/auth/login-service";

import { LoginUserDto } from "@/src/domain/user.dto";
import { LoginSchema } from "@/src/schemas/user-schema";

export class LoginController {
  async handle(data: LoginUserDto) {
    const validatedData = LoginSchema.parse(data);

    const service = new LoginService();
    return await service.execute(validatedData);
  }
}
