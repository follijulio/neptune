import { DeleteUserDto } from "@/src/domain/user.dto";
import { DeleteUserSchema } from "@/src/schemas/user-schema";
import { DeleteUserService } from "../../services/user/delete-user-service";

export class DeleteUserController {
  async delete(userData: DeleteUserDto) {
    try {
      const validatedData = DeleteUserSchema.parse(userData);
      const service = new DeleteUserService();
      
      return await service.delete(validatedData);
    } catch (error) {
      throw new Error("Erro ao apagar utilizador", { cause: error });
    }
  }
}