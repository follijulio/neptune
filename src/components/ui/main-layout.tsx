import { ReactNode } from "react";

import { NavBar } from "./nav-bar";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/lib/prisma";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayoutContent = ({ children }: MainLayoutProps) => {
  return (
    <main className="h-full w-full flex-1 overflow-scroll p-4">
      {children}
    </main>
  );
};

const MainLayoutContainer = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen w-screen flex-col bg-black text-white">
      {children}
    </div>
  );
};

const Footer = () => (
  <footer className="bg-black py-4 text-center">
    <p>&copy; 2026 Netuno. Todos os direitos reservados.</p>
  </footer>
);

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
