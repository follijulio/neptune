"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface UseUrlParamOptions {
  defaultValue?: string;
  toggle?: boolean;
}

export function useFilterParam(
  paramKey: string,
  options: UseUrlParamOptions = {},
) {
  const { defaultValue, toggle = false } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramValue = searchParams.get(paramKey);
  const [value, setValue] = useState<string | null>(
    paramValue ?? defaultValue ?? null,
  );

  const setParam = useCallback(
    (newValue: string) => {
      const next = toggle && value === newValue ? null : newValue;
      setValue(next);

      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set(paramKey, next);
      } else {
        params.delete(paramKey);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [toggle, value, paramKey, pathname, router, searchParams],
  );

  return { value, setParam };
}
