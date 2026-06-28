'use client';

import { useMemo } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "../shadcn-ui/button";

export default function MonthNavigator({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthName = useMemo(
    () => format(currentMonth, "MMMM yyyy", { locale: ptBR }),
    [currentMonth],
  );

  return (
    <div className="mx-auto mb-4 flex w-full max-w-70 items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-1.5 sm:max-w-xs sm:p-2 xl:mx-0">
      <Button
        variant="ghost"
        onClick={onPrevMonth}
        className="h-8 px-2 hover:bg-white hover:text-black sm:h-10 sm:px-3"
      >
        <LuChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <h2 className="w-32 truncate text-center text-base font-bold text-[#E0E0E0] capitalize sm:w-48 sm:text-xl">
        {monthName}
      </h2>
      <Button
        variant="ghost"
        onClick={onNextMonth}
        className="h-8 px-2 hover:bg-white hover:text-black sm:h-10 sm:px-3"
      >
        <LuChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
}