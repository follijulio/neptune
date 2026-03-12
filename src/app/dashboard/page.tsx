import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import DashboardClient from "@/src/components/ui/clients/dashboard-client";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [hasSemester, hasWorkload] = await Promise.all([
    prisma.semester.findFirst({
      where: { userId: session.user.id },
    }),
    prisma.workload.findFirst({
      where: { userId: session.user.id },
    }),
  ]);

  if (!hasSemester && !hasWorkload) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-0 sm:px-4">
      <DashboardClient userId={session.user.id} />
    </div>
  );
}
