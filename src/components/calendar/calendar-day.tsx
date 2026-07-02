import { useMemo } from "react";
import { useDraggable,useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isSameMonth, isToday } from "date-fns";

import { CalendarEvent } from "@/src/hooks/use-calendar";

function DraggableEvent({
  event,
  onEventClick,
}: {
  event: CalendarEvent;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
  });
  
  // Apenas altera a opacidade, sem usar o CSS.Translate
  const style = { opacity: isDragging ? 0.3 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => onEventClick(e, event)}
      className="shrink-0 cursor-grab active:cursor-grabbing truncate rounded border border-[#007AFF]/40 bg-[#007AFF]/20 px-1 py-0.5 text-[8px] font-semibold text-[#007AFF] shadow-sm transition-all hover:bg-[#007AFF]/40 sm:px-2 sm:py-1 sm:py-1.5 sm:text-xs sm:text-[10px]"
      title={event.title}
    >
      <span className="mr-0.5 hidden opacity-75 sm:mr-1 sm:inline">
        {format(new Date(event.date), "HH:mm")}
      </span>
      {event.title}
    </div>
  );
}

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

  const { setNodeRef } = useDroppable({
    id: day.toISOString(),
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayClick(day)}
      className={`flex cursor-pointer flex-col gap-1 overflow-hidden border-r border-b border-[#1A1A1A] p-1 transition-colors hover:bg-zinc-900/80 sm:p-2 ${!isCurrentMonth ? "bg-black/60 text-zinc-700" : "bg-transparent text-zinc-300"} ${(idx + 1) % 7 === 0 ? "border-r-0" : ""} `}
    >
      <div className="mb-0.5 flex shrink-0 justify-end sm:mb-1">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-2xl text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${isTodayDate ? "bg-[#007AFF] text-white shadow-[0_0_10px_rgba(0,122,255,0.5)]" : ""} `}
        >
          {dayNumber}
        </span>
      </div>

      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5 sm:gap-1.5 sm:pr-1">
        {dayEvents.map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}