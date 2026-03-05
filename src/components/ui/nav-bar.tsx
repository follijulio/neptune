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
  perfilImageUrl?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ perfilImageUrl }) => {
  return (
    <nav className="h-20 w-full flex flex-row items-center justify-between px-10 border-b border-[#888888]">
      <div className={`text-4xl flex flex-row items-center gap-2 select-none`}>
        <Link href="/">
          <span className={`font-bold ${jura.className} `}>Folliro</span>
        </Link>
      </div>
      <div className="flex items-center gap-20">
        <DropdownMenuPerfil perfilImageUrl={perfilImageUrl} />
      </div>
    </nav>
  );
};

export const DropdownMenuPerfil: React.FC<{ perfilImageUrl?: string }> = ({
  perfilImageUrl,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={perfilImageUrl} />
          <AvatarFallback>F</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 h-96" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={"/change_infos"}>Mudar informações</Link>
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
