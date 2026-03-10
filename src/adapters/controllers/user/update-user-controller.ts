import { UpdateUserService } from "../../services/user/update-user-service";

import { UpdateUserDto } from "@/src/domain/user.dto";
import { UpdateUserSchema } from "@/src/schemas/user-schema";

export class UpdateUserController {
  async update(userData: UpdateUserDto) {
    try {
      const validatedData = UpdateUserSchema.parse(userData);
      const service = new UpdateUserService();

      return await service.update(validatedData);
    } catch (error) {
      throw new Error("Erro ao atualizar usuário", { cause: error });
    }
  }
}
