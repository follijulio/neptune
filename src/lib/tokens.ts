import { prisma } from "@/prisma/lib/prisma";

export async function generateTwoFactorToken(email: string) {
  const token = Math.floor(100000 + Math.random() * 900000).toString();

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
