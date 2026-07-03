"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { isSameDay } from "date-fns";

import CalendarDay from "./calendar-day";

import { CalendarEvent } from "@/src/hooks/use-calendar";

export default function CalendarGrid({
  calendarDays,
  currentMonth,
  events,
  onDayClick,
  onEventClick,
  onEventDrop,
}: {
  calendarDays: Date[];
  currentMonth: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
  onEventDrop: (eventId: string, newDate: Date) => void;
}) {
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  const weekDays = useMemo(
    () => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    [],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const active = events.find((e) => e.id === event.active.id);
    if (active) setActiveEvent(active);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEvent(null);
    const { active, over } = event;
    if (over) {
      onEventDrop(active.id as string, new Date(over.id as string));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="custom-scrollbar w-full overflow-x-auto pb-2 sm:pb-4">
        <div className="min-w-75 overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] shadow-2xl sm:min-w-200 sm:rounded-xl">
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
                isSameDay(new Date(event.date), day),
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

      <DragOverlay>
        {activeEvent ? (
          <div className="cursor-grabbing truncate rounded border border-[#007AFF] bg-[#007AFF]/80 px-2 py-1.5 text-xs font-semibold text-white shadow-xl sm:text-[10px]">
            {activeEvent.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
