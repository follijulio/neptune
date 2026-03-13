import { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import LinksClient from "@/src/components/ui/clients/link-client";

export const metadata: Metadata = {
  title: "Netuno - Links",
};

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto w-full px-0 sm:px-4">
      <LinksClient initialLinks={links} />
    </div>
  );
}
