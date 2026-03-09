import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/prisma/lib/prisma";
import DashboardClient from "@/src/components/ui/clients/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const hasSemester = await prisma.semester.findFirst({
    where: { userId: session.user.id },
  });
  const hasWorkload = await prisma.workload.findFirst({
    where: { userId: session.user.id },
  });

  if (!hasSemester && !hasWorkload) {
    redirect("/onboarding");
  }

  return (
    <DashboardClient userId={session.user.id} userName={session.user.name} />
  );
}
