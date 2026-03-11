import { ReactNode } from "react";

import { NavBar } from "./nav-bar";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayoutContent = ({ children }: MainLayoutProps) => {
  return (
    <main className="bacl h-full w-full flex-1 overflow-scroll px-4">
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

  const firstLetter = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "N";


  return (
    <MainLayoutContainer>
      <NavBar firstLetter={firstLetter} profileImageUrl={session?.user?.image || ""} />
      <MainLayoutContent>{children}</MainLayoutContent>
    </MainLayoutContainer>
  );
}
