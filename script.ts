// adapters/services/user/create-user.ts
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const _ = await prisma.user.findMany();
  console.log(_);
}

main()