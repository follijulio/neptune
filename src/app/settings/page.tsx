import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import SettingsClient from "@/src/components/ui/clients/settings-client";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, email: true, image: true },
  });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
  });
  const isOAuth = !!account;

  return <SettingsClient user={dbUser} isOAuth={isOAuth} />;
}
