import { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import SettingsClient from "@/src/components/ui/clients/settings-client";

export const metadata: Metadata = {
  title: "Netuno - Configurações",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [dbUser, account] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, username: true, email: true, image: true },
    }),
    prisma.account.findFirst({
      where: { userId: session.user.id },
    }),
  ]);

  const isOAuth = !!account;

  return <SettingsClient user={dbUser} isOAuth={isOAuth} />;
}
