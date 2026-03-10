import { createUserDto } from "@/src/domain/user.dto";
import { RegisterSchema } from "@/src/schemas/user-schema";
import { CreateUserService } from "../../services/user/create-user-service";

export class CreateUserController {
  async create(user: createUserDto) {
    try {
      const validateUser = RegisterSchema.parse(user);
      const service = new CreateUserService();
      const newUser = await service.create(validateUser);

      return { id: newUser.id, email: newUser.email };
    } catch (error) {
      throw new Error("Erro ao criar usuário", { cause: error });
    }
  }
}
