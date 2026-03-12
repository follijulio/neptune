import { ReactNode } from "react";

import { NavBar } from "./nav-bar";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayoutContent = ({ children }: MainLayoutProps) => {
  return (
    <main className="h-full w-full flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
      {children}
    </main>
  );
};

const MainLayoutContainer = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-dvh w-full flex-col bg-black text-white">
      {children}
    </div>
  );
};

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth();

  const firstLetter = session?.user?.name?.charAt(0).toUpperCase() ?? "N";

  const dbImageUrl = session?.user?.id
    ? ((
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { image: true },
        })
      )?.image ?? undefined)
    : undefined;

  return (
    <MainLayoutContainer>
      <NavBar firstLetter={firstLetter} profileImageUrl={dbImageUrl} />
      <MainLayoutContent>{children}</MainLayoutContent>
    </MainLayoutContainer>
  );
}
