'use client';

import { useMemo } from "react";
import { isSameDay } from "date-fns";

import CalendarDay from "./calendar-day";

import { CalendarEvent } from "@/src/hooks/use-calendar";


export default function CalendarGrid({
  calendarDays,
  currentMonth,
  events,
  onDayClick,
  onEventClick,
}: {
  calendarDays: Date[];
  currentMonth: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  const weekDays = useMemo(
    () => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    [],
  );

  return (
    <div className="custom-scrollbar w-full overflow-x-auto pb-2 sm:pb-4">
      <div className="min-w-75 overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] shadow-2xl sm:min-w-200 sm:rounded-2xl">
        <div className="grid grid-cols-7 border-b border-[#1A1A1A] bg-[#121212]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase sm:py-3 sm:text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid auto-rows-[80px] grid-cols-7 sm:auto-rows-[120px] lg:auto-rows-[140px]">
          {calendarDays.map((day, idx) => {
            const dayEvents = events.filter((event) =>
              isSameDay(event.date as Date, day),
            );
            return (
              <CalendarDay
                key={day.toString()}
                day={day}
                dayEvents={dayEvents}
                currentMonth={currentMonth}
                idx={idx}
                onDayClick={onDayClick}
                onEventClick={onEventClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}