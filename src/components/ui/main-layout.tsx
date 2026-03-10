import { NavBar } from "./nav-bar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-screen flex-col gap-4 bg-black py-2 text-white">
      <NavBar />
      <main className="flex-1 px-4">{children}</main>
    </div>
  );
};
export default MainLayout;
