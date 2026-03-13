"use client";

import { useMemo } from "react";
import { LuHexagon, LuLogOut, LuMenu, LuSettings } from "react-icons/lu";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "../shadcn-ui/avatar";
import { Button } from "../shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn-ui/dropdown-menu";

import { logoutAction } from "@/src/app/actions/auth-action";

interface NavBarProps {
  profileImageUrl?: string;
  firstLetter: string;
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
  { label: "Configurações", href: "/settings" },
];

const HIDDEN_ROUTES = ["/login", "/onboarding"];

export const NavBar: React.FC<NavBarProps> = ({
  profileImageUrl,
  firstLetter,
}) => {
  const pathname = usePathname();

  const isHiddenRoute = useMemo(() => {
    if (!pathname) return false;
    return HIDDEN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
  }, [pathname]);

  const isPrivateRoute = useMemo(() => {
    if (!pathname) return false;
    return NAV_ITEMS.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
  }, [pathname]);

  if (!pathname || isHiddenRoute) return null;

  if (pathname === "/") {
    return <PublicNavBar />;
  }

  if (isPrivateRoute) {
    return (
      <PrivateNavBar
        profileImageUrl={profileImageUrl}
        firstLetter={firstLetter}
      />
    );
  }

  return null;
};

const PublicNavBar = () => (
  <header className="sticky top-0 z-50 w-full border-b border-[#1A1A1A] bg-[#000000]/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
      <Logo />

      <nav className="flex items-center gap-2 sm:gap-4">
        <Link href="/login">
          <Button
            variant="ghost"
            className="px-3 text-sm text-[#888888] hover:bg-[#121212] hover:text-[#E0E0E0] sm:px-4 sm:text-base"
          >
            Entrar
          </Button>
        </Link>
        <Link href="/login?tab=register">
          <Button className="h-9 bg-[#E0E0E0] px-3 text-sm font-semibold text-[#000000] hover:bg-[#CCCCCC] sm:h-10 sm:px-4 sm:text-base">
            Começar agora
          </Button>
        </Link>
      </nav>
    </div>
  </header>
);

const PrivateNavBar: React.FC<NavBarProps> = ({
  profileImageUrl,
  firstLetter,
}) => (
  <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/30 px-4 backdrop-blur-md sm:px-8">
    <section className="flex w-auto lg:w-full lg:justify-start">
      <Logo />
    </section>

    <section className="hidden w-full justify-center lg:flex">
      <NavLinks />
    </section>

    <section className="flex w-auto items-center gap-3 sm:gap-4 lg:w-full lg:justify-end">
      <MobileNav />
      <UserMenu profileImageUrl={profileImageUrl} firstLetter={firstLetter} />
    </section>
  </nav>
);

const Logo = () => (
  <Link href="/" className="flex items-center text-xl select-none sm:text-2xl">
    <span className="flex items-center gap-2 font-bold tracking-wider text-white">
      <LuHexagon className="inline text-2xl text-[#007AFF]" />
      <p>Netuno</p>
    </span>
  </Link>
);

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4">
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

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <div className="flex lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-2xl text-white transition-colors duration-300 hover:bg-white focus-visible:ring-0"
          >
            <LuMenu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mr-4 w-56 border-[#1A1A1A] bg-[#121212] text-white"
          align="end"
        >
          <DropdownMenuLabel className="text-zinc-400">Menu</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#1A1A1A]" />
          <DropdownMenuGroup>
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <DropdownMenuItem
                  asChild
                  key={item.href}
                  className="cursor-pointer focus:bg-zinc-800/50"
                >
                  <Link
                    href={item.href}
                    className={`flex w-full items-center py-2 ${
                      isActive
                        ? "font-semibold text-[#007AFF]"
                        : "text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface UserMenuProps {
  profileImageUrl?: string;
  firstLetter: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  profileImageUrl,
  firstLetter,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]">
      <Avatar className="h-9 w-9 cursor-pointer border border-[#1A1A1A] transition-colors hover:border-zinc-700 sm:h-10 sm:w-10">
        <AvatarImage src={profileImageUrl} alt="Perfil do usuário" />
        <AvatarFallback className="bg-[#007AFF] font-bold text-white">
          {firstLetter}
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

      <SettingsMenuGroup />

      <DropdownMenuSeparator className="bg-[#1A1A1A]" />

      <LogoutMenuGroup />
    </DropdownMenuContent>
  </DropdownMenu>
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
