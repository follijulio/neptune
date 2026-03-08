import Link from "next/link";
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

interface NavBarProps {
  profileImageUrl?: string;
}

interface UserMenuProps {
  profileImageUrl?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ profileImageUrl }) => {
  return (
    <nav className="h-20 w-full flex flex-row items-center justify-between px-10 border-b border-[#888888]">
      <Logo />
      <UserMenu profileImageUrl={profileImageUrl} />
    </nav>
  );
};

const Logo = () => (
  <Link href="/" className="text-4xl select-none">
    <span className={`font-bold ${jura.className}`}>Netuno</span>
  </Link>
);

const UserMenu: React.FC<UserMenuProps> = ({ profileImageUrl }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={profileImageUrl} alt="Perfil do usuário" />
          <AvatarFallback>F</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/change_infos">Mudar informações</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Sair da conta</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
