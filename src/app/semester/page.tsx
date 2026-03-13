import { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import SemesterClient from "@/src/components/ui/clients/semester-client";

export const metadata: Metadata = {
  title: "Netuno - Semestres",
};

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const semesters = await prisma.semester.findMany({
    where: { userId: session.user.id },
    orderBy: { title: "desc" },
    include: {
      subjects: {
        orderBy: { name: "asc" },
      },
    },
  });

  return <SemesterClient initialSemesters={semesters} />;
}
