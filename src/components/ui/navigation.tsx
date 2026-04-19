"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  userName?: string | null;
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
  { label: "Treinamento", href: "/quests" },
  { label: "Configurações", href: "/settings" },
];

const HIDDEN_ROUTES = ["/login", "/onboarding"];

export const Navigation: React.FC<NavigationProps> = ({
  children,
  profileImageUrl,
  firstLetter,
  userName,
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

  if (!pathname || isHiddenRoute) {
    return (
      <main className="flex h-dvh w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-black text-white">
        {children}
      </main>
    );
  }

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

  if (isPrivateRoute) {
    return (
      <div className="flex h-screen w-full flex-col bg-black text-white lg:flex-row">
        <PrivateSidebar
          profileImageUrl={profileImageUrl}
          firstLetter={firstLetter}
          userName={userName}
        />
        <main className="h-full w-full flex-1 overflow-x-hidden overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <main className="flex h-dvh w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-black text-white">
      {children}
    </main>
  );
};

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

const PrivateSidebar: React.FC<Omit<NavigationProps, "children">> = ({
  profileImageUrl,
  firstLetter,
  userName,
}) => {
  const pathname = usePathname();

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeBoxStyle, setActiveBoxStyle] = useState({
    top: 0,
    height: 0,
    opacity: 0,
  });

  const activeIndex = useMemo(() => {
    return NAV_ITEMS.findIndex(
      (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`),
    );
  }, [pathname]);

  useEffect(() => {
    const savedWidth = localStorage.getItem("netuno_sidebar_width");
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  // TODO: precisa-se otimizar isso. pq? (resposta abaixo...)
  //? Isso aqui eu tenho que ver se tem como otimizar,
  //? pq, tipo, toda vez que o mouse se move ele atualiza o estado do sidebarWidth,
  //? e isso faz com que o componente inteiro seja re-renderizado - eu acho... - mesmo as partes que não dependem dessa largura.
  //? Talvez seja possível usar uma ref para armazenar a largura atual durante o redimensionamento e só atualizar o estado quando o usuário soltar o mouse,
  //? Pra evitar essa suruba de renderizações sem motivo, tenho q pensar em uma solução um pouco melhor.
  //? Vou tentar implementar isso depois. Por enquanto, vou deixar assim, essa porra tá funcionando,
  //? não quero arrumar o que não tá quebrado.
  //! Se você está lendo isso, você é maluco...
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 200), 480);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem("netuno_sidebar_width", sidebarWidth.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  useEffect(() => {
    if (activeIndex !== -1 && linkRefs.current[activeIndex]) {
      const activeElement = linkRefs.current[activeIndex];
      if (activeElement) {
        setActiveBoxStyle({
          top: activeElement.offsetTop,
          height: activeElement.offsetHeight,
          opacity: 1,
        });
      }
    } else {
      setActiveBoxStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, sidebarWidth]);

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#000000]/80 px-4 backdrop-blur-md lg:hidden">
        <Logo />
        <div className="flex items-center gap-3">
          <MobileUserMenu
            profileImageUrl={profileImageUrl}
            firstLetter={firstLetter}
            userName={userName}
          />
          <MobileNav />
        </div>
      </nav>

      <aside
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className={`relative hidden shrink-0 flex-col border-r border-[#1A1A1A] bg-[#000000] lg:flex ${
          isResizing ? "select-none" : ""
        }`}
      >
        <div className="flex h-20 items-center px-6">
          <Logo />
        </div>

        <nav className="relative flex flex-1 flex-col gap-2 overflow-y-auto py-6 pr-4">
          <div
            className="absolute right-4 left-0 z-0 rounded-r-lg bg-[#1A1A1A] transition-all duration-300 ease-in-out"
            style={{
              top: `${activeBoxStyle.top}px`,
              height: `${activeBoxStyle.height}px`,
              opacity: activeBoxStyle.opacity,
            }}
          />

          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => {
                  linkRefs.current[index] = el;
                }}
                className={`relative z-10 flex items-center gap-3 rounded-r-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#007AFF]"
                    : "text-zinc-400 hover:bg-[#121212]/80 hover:text-white"
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
            userName={userName}
          />
        </div>

        <div
          onMouseDown={() => setIsResizing(true)}
          className={`absolute top-0 right-[-2px] z-50 h-full w-[4px] cursor-col-resize transition-colors duration-200 ${
            isResizing ? "bg-[#007AFF]" : "hover:bg-[#007AFF]/50"
          }`}
        />
      </aside>
    </>
  );
};

const Logo = () => (
  <Link
    href="/dashboard"
    className="flex items-center text-xl select-none sm:text-2xl"
  >
    <span className="flex items-center gap-2 font-bold tracking-wider text-white">
      <LuHexagon className="inline text-2xl text-[#007AFF]" />
      <p>Netuno</p>
    </span>
  </Link>
);

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

const MobileUserMenu: React.FC<Omit<NavigationProps, "children">> = ({
  profileImageUrl,
  firstLetter,
  userName,
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

const DesktopUserMenu: React.FC<Omit<NavigationProps, "children">> = ({
  profileImageUrl,
  firstLetter,
  userName,
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
          {userName ? `Olá, ${userName}!` : "Minha conta"}
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
