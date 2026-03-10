import { ReactNode } from "react";
import { NavBar } from "./nav-bar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayoutContent = ({ children }: MainLayoutProps) => {
  return <main className="flex-1 px-4">{children}</main>;
};

const MainLayoutContainer = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen w-screen flex-col gap-4 bg-black py-2 text-white">
      {children}
    </div>
  );
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <MainLayoutContainer>
      <NavBar />
      <MainLayoutContent>{children}</MainLayoutContent>
    </MainLayoutContainer>
  );
};

export default MainLayout;
