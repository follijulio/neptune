import { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import DashboardClient from "@/src/components/ui/clients/dashboard-client";

export const metadata: Metadata = {
  title: "Netuno - Dashboard",
};

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [hasSemester, hasWorkload, user] = await Promise.all([
    prisma.semester.findFirst({
      where: { userId: session.user.id },
    }),
    prisma.workload.findFirst({
      where: { userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
  ]);

  if (!hasSemester && !hasWorkload) {
    redirect("/onboarding");
  }

  return (
    <div>
      <DashboardClient
        userId={session.user.id}
        userName={user?.name}
      />
    </div>
  );
}
