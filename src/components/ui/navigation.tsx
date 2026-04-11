"use client";

import { useMemo, useState } from "react";
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

interface NavigationProps {
  children: React.ReactNode;
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

export const Navigation: React.FC<NavigationProps> = ({
  children,
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

  // Rotas como Login ou Onboarding (Apenas o conteúdo puro)
  if (!pathname || isHiddenRoute) {
    return (
      <main className="flex h-dvh w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-black text-white">
        {children}
      </main>
    );
  }

  // Rota Pública (Landing Page mantendo Navbar superior)
  if (pathname === "/") {
    return (
      <div className="flex h-dvh w-full flex-col bg-black text-white">
        <PublicNavBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    );
  }

  // Rotas Privadas (App com Sidebar no Desktop e Navbar no Mobile)
  if (isPrivateRoute) {
    return (
      <div className="flex h-dvh w-full flex-col bg-black text-white lg:flex-row">
        <PrivateSidebar
          profileImageUrl={profileImageUrl}
          firstLetter={firstLetter}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    );
  }

  // Fallback de segurança
  return (
    <main className="flex h-dvh w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-black text-white">
      {children}
    </main>
  );
};

/* ================= PUBLIC NAVBAR ================= */
const PublicNavBar = () => (
  <header className="sticky top-0 z-50 w-full shrink-0 border-b border-[#1A1A1A] bg-[#000000]/80 backdrop-blur-md">
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

/* ================= PRIVATE SIDEBAR / MOBILE NAV ================= */
const PrivateSidebar: React.FC<Omit<NavigationProps, "children">> = ({
  profileImageUrl,
  firstLetter,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* MOBILE TOP BAR (Apenas em telas menores que lg) */}
      <nav className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#000000]/80 px-4 backdrop-blur-md lg:hidden">
        <Logo />
        <div className="flex items-center gap-3">
          <MobileUserMenu
            profileImageUrl={profileImageUrl}
            firstLetter={firstLetter}
          />
          <MobileNav />
        </div>
      </nav>

      {/* DESKTOP SIDEBAR (Apenas em telas maiores que lg) */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#1A1A1A] bg-[#000000] lg:flex">
        <div className="flex h-20 items-center px-6">
          <Logo />
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#1A1A1A] text-[#007AFF]"
                    : "text-zinc-400 hover:bg-[#121212] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#1A1A1A] p-4">
          <DesktopUserMenu
            profileImageUrl={profileImageUrl}
            firstLetter={firstLetter}
          />
        </div>
      </aside>
    </>
  );
};

const Logo = () => (
  <Link href="/" className="flex items-center text-xl select-none sm:text-2xl">
    <span className="flex items-center gap-2 font-bold tracking-wider text-white">
      <LuHexagon className="inline text-2xl text-[#007AFF]" />
      <p>Netuno</p>
    </span>
  </Link>
);

/* ================= MOBILE NAVIGATION ================= */
const MobileNav = () => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu principal"
          className="text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:ring-0"
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
                    isActive ? "font-semibold text-[#007AFF]" : "text-zinc-400"
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
  );
};

/* ================= MENUS DE USUÁRIO ================= */
// Menu simplificado para Mobile (Topo)
const MobileUserMenu: React.FC<Omit<NavigationProps, "children">> = ({
  profileImageUrl,
  firstLetter,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]">
      <Avatar className="h-9 w-9 cursor-pointer border border-[#1A1A1A] transition-colors hover:border-zinc-700">
        <AvatarImage src={profileImageUrl} alt="Perfil do usuário" />
        <AvatarFallback className="bg-[#007AFF] font-bold text-white">
          {firstLetter}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      className="w-48 border-[#1A1A1A] bg-[#121212] text-white"
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

// Menu em formato de "Card" para o final da Sidebar (Desktop)
const DesktopUserMenu: React.FC<Omit<NavigationProps, "children">> = ({
  profileImageUrl,
  firstLetter,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors outline-none hover:bg-[#1A1A1A] focus-visible:ring-2 focus-visible:ring-[#007AFF]">
      <Avatar className="h-10 w-10 border border-[#1A1A1A]">
        <AvatarImage src={profileImageUrl} alt="Perfil" />
        <AvatarFallback className="bg-[#007AFF] text-sm font-bold text-white">
          {firstLetter}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-white">
          Minha Conta
        </span>
        <span className="truncate text-xs text-zinc-500">Opções</span>
      </div>
      <LuSettings className="text-zinc-400" />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      className="w-[220px] border-[#1A1A1A] bg-[#121212] text-white"
      align="end"
      side="right"
      sideOffset={16}
    >
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

const LogoutMenuGroup = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    await logoutAction();
  };

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem
        onSelect={handleLogout}
        disabled={loading}
        className="cursor-pointer text-[#FF3B30] hover:bg-[#FF3B30]/10 focus:bg-[#FF3B30]/10 focus:text-[#FF3B30]"
      >
        {loading ? (
          <span className="flex w-full animate-pulse items-center gap-2 text-[#FF3B30]">
            <LuLogOut className="text-lg" />
            <span>Saindo...</span>
          </span>
        ) : (
          <span className="flex w-full items-center gap-2">
            <LuLogOut className="text-lg" />
            <span>Sair da conta</span>
          </span>
        )}
      </DropdownMenuItem>
    </DropdownMenuGroup>
  );
};
