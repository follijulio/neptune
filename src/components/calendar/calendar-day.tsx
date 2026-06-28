import { useMemo } from "react";
import { format, isSameMonth, isToday } from "date-fns";

import { CalendarEvent } from "@/src/hooks/use-calendar";


export default function CalendarDay({
  day,
  dayEvents,
  currentMonth,
  idx,
  onDayClick,
  onEventClick,
}: {
  day: Date;
  dayEvents: CalendarEvent[];
  currentMonth: Date;
  idx: number;
  onDayClick: (day: Date) => void;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  const isCurrentMonth = useMemo(
    () => isSameMonth(day, currentMonth),
    [day, currentMonth],
  );
  const isTodayDate = useMemo(() => isToday(day), [day]);
  const dayNumber = useMemo(() => format(day, "d"), [day]);

  return (
    <div
      onClick={() => onDayClick(day)}
      className={`flex cursor-pointer flex-col gap-1 overflow-hidden border-r border-b border-[#1A1A1A] p-1 transition-colors hover:bg-zinc-900/80 sm:p-2 ${!isCurrentMonth ? "bg-black/60 text-zinc-700" : "bg-transparent text-zinc-300"} ${(idx + 1) % 7 === 0 ? "border-r-0" : ""} `}
    >
      <div className="mb-0.5 flex shrink-0 justify-end sm:mb-1">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${isTodayDate ? "bg-[#007AFF] text-white shadow-[0_0_10px_rgba(0,122,255,0.5)]" : ""} `}
        >
          {dayNumber}
        </span>
      </div>

      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5 sm:gap-1.5 sm:pr-1">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            onClick={(e) => onEventClick(e, event)}
            className="shrink-0 cursor-pointer truncate rounded border border-[#007AFF]/40 bg-[#007AFF]/20 px-1 py-0.5 text-[8px] font-semibold text-[#007AFF] shadow-sm transition-all hover:bg-[#007AFF]/40 sm:px-2 sm:py-1 sm:py-1.5 sm:text-xs sm:text-[10px]"
            title={event.title}
          >
            <span className="mr-0.5 hidden opacity-75 sm:mr-1 sm:inline">
              {format(event.date as Date, "HH:mm")}
            </span>
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
}