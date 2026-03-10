"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuHexagon, LuLogOut, LuSettings } from "react-icons/lu";

import { logoutAction } from "@/src/app/actions/auth-action";
import { Button } from "../shadcn-ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn-ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn-ui/dropdown-menu";

interface NavBarProps {
  profileImageUrl?: string;
}

interface NavItem {
  label: React.ReactNode;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Mural", href: "/mural" },
  { label: "Calendário", href: "/calendar" },
  { label: "Links", href: "/links" },
  { label: "Semestre", href: "/semester" },
  { label: "Pomodoro", href: "/pomodoro" },
  { label: <LuSettings className="text-xl" />, href: "/settings" },
];

export const NavBar: React.FC<NavBarProps> = ({ profileImageUrl }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isNavPage = NAV_ITEMS.some((item) => pathname?.startsWith(item.href));

  if (isHomePage || !isNavPage) {
    return <PublicNavBar />;
  }

  return <PrivateNavBar profileImageUrl={profileImageUrl} />;
};

const PublicNavBar = () => (
  <header className="sticky top-0 z-50 w-full border-b border-[#1A1A1A] bg-[#000000]/80 backdrop-blur-md">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
      <Logo />

      <nav className="flex items-center gap-4">
        <Link href="/login">
          <Button
            variant="ghost"
            className="text-[#888888] hover:bg-[#121212] hover:text-[#E0E0E0]"
          >
            Entrar
          </Button>
        </Link>
        <Link href="/login?tab=register">
          <Button className="bg-[#E0E0E0] font-semibold text-[#000000] hover:bg-[#CCCCCC]">
            Começar agora
          </Button>
        </Link>
      </nav>
    </div>
  </header>
);

const PrivateNavBar: React.FC<NavBarProps> = ({ profileImageUrl }) => (
  <nav className="sticky top-0 z-50 grid h-16 w-full grid-cols-3 items-center justify-between border-b border-white/30 px-8 backdrop-blur-md">
    <section className="flex w-full justify-start">
      <Logo />
    </section>
    <section className="flex w-full justify-center">
      <NavLinks />
    </section>
    <section className="flex w-full justify-end">
      <UserMenu profileImageUrl={profileImageUrl} />
    </section>
  </nav>
);

const Logo = () => (
  <Link href="/dashboard" className="flex items-center text-2xl select-none">
    <span className="flex items-center gap-2 font-bold tracking-wider text-white">
      <LuHexagon className="inline text-2xl text-[#007AFF]" />
      <p>Netuno</p>
    </span>
  </Link>
);

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-4 md:flex">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </div>
  );
};

interface NavLinkProps {
  item: NavItem;
  pathname: string;
}

const NavLink: React.FC<NavLinkProps> = ({ item, pathname }) => {
  const isActive =
    pathname === item.href || pathname?.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`text-base font-medium transition-all duration-200 hover:text-white ${
        isActive ? "font-semibold text-[#007AFF]" : "text-zinc-500"
      }`}
    >
      {item.label}
    </Link>
  );
};

interface UserMenuProps {
  profileImageUrl?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ profileImageUrl }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <UserAvatar profileImageUrl={profileImageUrl} />
    </DropdownMenuTrigger>

    <DropdownMenuContent
      className="mr-4 w-48 border-[#1A1A1A] bg-[#121212] text-white"
      align="end"
    >
      <DropdownMenuLabel className="text-zinc-400">
        Minha Conta
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-[#1A1A1A]" />

      <SettingsMenuGroup />

      <DropdownMenuSeparator className="bg-[#1A1A1A]" />

      <LogoutMenuGroup />
    </DropdownMenuContent>
  </DropdownMenu>
);

const UserAvatar: React.FC<UserMenuProps> = ({ profileImageUrl }) => (
  <Avatar className="cursor-pointer border border-[#1A1A1A] transition-colors hover:border-zinc-700">
    <AvatarImage src={profileImageUrl} alt="Perfil do usuário" />
    <AvatarFallback className="bg-[#007AFF] font-bold text-white">
      U
    </AvatarFallback>
  </Avatar>
);

const SettingsMenuGroup = () => (
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
);

const LogoutMenuGroup = () => (
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
);
