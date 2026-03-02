import { Jura } from "next/font/google";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { DropdownMenuSemester } from "../ui/dropdown";

const jura = Jura({
  variable: "--font-jura",
  weight: "500",
  subsets: ["latin"],
});

const semester = [
  { title: "Geral", value: "geral" },
  { title: "2026.1", value: "2026.1" },
  { title: "2026.2", value: "2026.2" },
  { title: "2027.1", value: "2027.1" },
  { title: "2027.2", value: "2027.2" },
  { title: "2028.1", value: "2028.1" },
  { title: "2028.2", value: "2028.2" },
  { title: "2029.1", value: "2029.1" },
  { title: "2029.2", value: "2029.2" },
];

export const NavBar = () => {
  return (
    <nav className="h-1/12 w-full flex flex-row items-center justify-between px-10 border-b border-[#888888]">
      <div className={`text-4xl flex flex-row items-center gap-2 select-none`}>
        <Link href="/">
          <span className={`font-bold ${jura.className} `}>Folliro</span>
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <DropdownMenuSemester param={"semester"} elements={semester} />
        <AvatarUser />
      </div>
    </nav>
  );
};

const AvatarUser: React.FC = () => {
  return (
    <Avatar className="cursor-pointer">
      <AvatarImage src="https://github.com/follijulio.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
