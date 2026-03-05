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

interface DropdownOption {
  title: string;
  value: string;
}

interface DropdownMenuSemesterProps {
  title?: string;
  param: string;
  elements: DropdownOption[];
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoApply?: boolean;
}

export function DropdownMenuSemester({
  elements,
  className = "",
  title = "Semestre",
  param,
  value,
  onChange,
  autoApply = true,
}: DropdownMenuSemesterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updateUrlParams = (selectedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!selectedValue || selectedValue === "geral") {
      params.delete(param);
    } else {
      params.set(param, selectedValue);
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSelect = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
      return;
    }

    if (autoApply) {
      updateUrlParams(selectedValue);
    }
  };

  const currentValue = value || searchParams.get(param);
  const selectedOption = elements.find(
    (option) => option.value === currentValue,
  );
  const buttonLabel = selectedOption?.title || title;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`bg-black border text-white max-w-20 min-w-20 ${className}`}
        >
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-w-40 min-w-40" align="center">
        <DropdownMenuGroup className="bg-black text-white">
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {elements.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="cursor-pointer"
            >
              {option.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
