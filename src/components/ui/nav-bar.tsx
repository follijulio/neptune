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
import { LuHexagon, LuLogOut, LuSettings } from "react-icons/lu";
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
  { label: "Calendário", href: "/calendar" },
  { label: "Links", href: "/links" },
  { label: "Configurações", href: "/settings" },
];

export const NavBar: React.FC<NavBarProps> = ({ profileImageUrl }) => {
  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/30 px-8 backdrop-blur-md">
      <Logo />
      <NavLinks />
      <UserMenu profileImageUrl={profileImageUrl} />
    </nav>
  );
};

export const Logo = () => (
  <Link href="/dashboard" className="flex items-center text-2xl select-none">
    <span
      className={`flex items-center gap-2 font-bold tracking-wider text-white`}
    >
      <LuHexagon className="inline text-2xl text-[#007AFF]" />
      <p className="">Netuno</p>
    </span>
  </Link>
);

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-8 md:flex">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-semibold transition-colors hover:text-white ${
              isActive ? "text-xl text-[#007AFF]" : "text-base text-zinc-500"
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
        <Avatar className="cursor-pointer border border-[#1A1A1A] transition-colors hover:border-zinc-700">
          <AvatarImage src={profileImageUrl} alt="Perfil do usuário" />
          <AvatarFallback className="bg-[#007AFF] font-bold text-white">
            U
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="mr-4 w-48 border-[#1A1A1A] bg-[#121212] text-white"
        align="end"
      >
        <DropdownMenuLabel className="text-zinc-400">
          Minha Conta
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#1A1A1A]" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="cursor-pointer *:text-white hover:bg-zinc-800/50 focus:bg-zinc-800/50"
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
              className="cursor-pointer text-[#FF3B30] hover:bg-[#FF3B30]/10 focus:bg-[#FF3B30]/10 focus:text-[#FF3B30]"
            >
              <button type="submit" className="flex w-full items-center gap-2">
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
