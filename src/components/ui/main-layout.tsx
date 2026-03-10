import { NavBar } from "./nav-bar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-black flex flex-col gap-4 w-screen py-2 min-h-screen text-white">
      <NavBar />
      <main className="flex-1 px-4">{children}</main>
    </div>
  );
};
export default MainLayout;
