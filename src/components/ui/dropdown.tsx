"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../shadcn-ui/dropdown-menu";

interface ElementoDropdown {
  title: string;
  value: string;
}

interface DropdownMenuLogicProps {
  title?: string;
  param: string;
  elements: ElementoDropdown[];
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoApply?: boolean;
}

export function DropdownMenuSemester({
  elements,
  className,
  title = "Semestre",
  param,
  value,
  onChange,
  autoApply = true,
}: DropdownMenuLogicProps) {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  function handleChange(valueSelected: string) {
    if (onChange) {
      onChange(valueSelected);
      return;
    }

    if (autoApply) {
      const params = new URLSearchParams(searchParams.toString());
      if (!valueSelected || valueSelected === "geral") {
        params.delete(param);
      } else {
        params.set(param, valueSelected);
      }
      replace(`${pathName}?${params.toString()}`, { scroll: false });
    }
  }

  const valorAtual = value || searchParams.get(param);
  const elementselecionado = elements.find((el) => el.value === valorAtual);
  const titleBotao = elementselecionado ? elementselecionado.title : title;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`bg-black border text-white max-w-20 min-w-20 ${className || ""}`}
        >
          {titleBotao}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-w-40 min-w-40" align="center">
        <DropdownMenuGroup className="bg-black text-white">
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {elements.map((item, i) => (
            <DropdownMenuItem
              key={item.value + i}
              onClick={() => handleChange(item.value)}
              className="cursor-pointer"
            >
              {item.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
