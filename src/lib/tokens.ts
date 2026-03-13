import { prisma } from "@/prisma/lib/prisma";
import { randomInt } from "crypto";

export async function generateTwoFactorToken(email: string) {
  const token = randomInt(100000, 1000000).toString();

  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await prisma.twoFactorToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await prisma.twoFactorToken.delete({
      where: { id: existingToken.id },
    });
  }

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return twoFactorToken;
}
