import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import LinksClient from "@/src/components/ui/clients/link-client";
import { redirect } from "next/navigation";

export default async function LinksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return <LinksClient initialLinks={links} />;
}
