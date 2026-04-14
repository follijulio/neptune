import { ReactNode } from "react";

import { Navigation } from "./navigation";
import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth();

  const userName = session?.user?.name?.split(" ")[0] ?? null;
  const firstLetter =
    userName !== null && userName !== undefined
      ? userName.charAt(0).toUpperCase()
      : "N";

  const dbImageUrl = session?.user?.id
    ? ((
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { image: true },
        })
      )?.image ?? undefined)
    : undefined;

  return (
    <Navigation
      firstLetter={firstLetter}
      profileImageUrl={dbImageUrl}
      userName={userName}
    >
      {children}
    </Navigation>
  );
}
