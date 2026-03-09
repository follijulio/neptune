"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn-ui/avatar";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../shadcn-ui/dropdown-menu";
import jura from "@/src/assets/fonts/jura";
import { LuLogOut, LuSettings } from "react-icons/lu";
import { logoutAction } from "@/src/app/actions/auth-action";

interface NavBarProps {
  profileImageUrl?: string;
}

interface UserMenuProps {
  profileImageUrl?: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Mural", href: "/mural" },
  { label: "Calendário", href: "/calendar" }, //todo: implementar rota
  { label: "Links", href: "/links" }, //todo: implementar rota
];

export const NavBar: React.FC<NavBarProps> = ({ profileImageUrl }) => {
  return (
    <nav className="h-16 w-full flex items-center justify-between px-8 border-b border-[#1A1A1A] bg-[#000000]/80 backdrop-blur-md sticky top-0 z-50">
      <Logo />
      <NavLinks />
      <UserMenu profileImageUrl={profileImageUrl} />
    </nav>
  );
};

const Logo = () => (
  <Link href="/dashboard" className="text-2xl select-none flex items-center">
    <span className={`font-bold text-white tracking-wider ${jura.className}`}>
      Netuno
    </span>
  </Link>
);

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center gap-8">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-medium transition-colors hover:text-white ${
              isActive ? "text-[#007AFF] text-xl" : "text-zinc-500 text-base"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

const UserMenu: React.FC<UserMenuProps> = ({ profileImageUrl }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer border border-[#1A1A1A] hover:border-zinc-700 transition-colors">
          <AvatarImage src={profileImageUrl} alt="Perfil do usuário" />
          <AvatarFallback className="bg-[#007AFF] text-white font-bold">
            U
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-48 bg-[#121212] border-[#1A1A1A] text-white mr-4"
        align="end"
      >
        <DropdownMenuLabel className="text-zinc-400">
          Minha Conta
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#1A1A1A]" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-zinc-800/50 focus:bg-zinc-800/50"
          >
            <Link href="/settings" className="flex items-center gap-2">
              <LuSettings className="text-lg text-zinc-400" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-[#1A1A1A]" />

        <DropdownMenuGroup>
          <form action={logoutAction}>
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-[#FF3B30]/10 focus:bg-[#FF3B30]/10 text-[#FF3B30] focus:text-[#FF3B30]"
            >
              <button type="submit" className="w-full flex items-center gap-2">
                <LuLogOut className="text-lg" />
                <span>Sair da conta</span>
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
