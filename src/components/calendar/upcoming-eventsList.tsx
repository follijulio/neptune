import { LuCalendarDays, LuClock } from "react-icons/lu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { CalendarEvent } from "@/src/hooks/use-calendar";

export default function UpcomingEventsList({
  events,
  onEventClick,
}: {
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  return (
    <div className="sticky top-20 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 shadow-xl sm:top-24 sm:rounded-xl sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:mb-6 sm:text-xl">
        <LuCalendarDays className="h-5 w-5 text-[#007AFF] sm:h-6 sm:w-6" />
        Eventos próximos
      </h3>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#1A1A1A] py-4 text-center text-xs text-zinc-500 sm:rounded-xl sm:py-6 sm:text-sm">
          Nenhum evento agendado para os próximos dias.
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {events.map((event) => (
            <div
              key={`side-${event.id}`}
              onClick={(e) => onEventClick(e, event)}
              className="group -m-1 flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-900/50 sm:-m-2 sm:gap-4 sm:rounded-xl"
            >
              <div className="min-w-10 shrink-0 rounded-md border border-[#1A1A1A] bg-[#121212] p-1.5 text-center transition-colors group-hover:border-[#007AFF]/50 sm:min-w-12.5 sm:rounded-lg sm:p-2">
                <div className="text-[8px] font-bold text-[#007AFF] uppercase sm:text-[10px]">
                  {format(event.date as Date, "MMM", { locale: ptBR })}
                </div>
                <div className="mt-0.5 text-base leading-none font-bold text-white sm:mt-1 sm:text-lg">
                  {format(event.date as Date, "dd")}
                </div>
              </div>
              <div className="flex flex-col pt-0.5 sm:pt-1">
                <span className="line-clamp-2 text-xs leading-tight font-bold text-[#E0E0E0] transition-colors group-hover:text-[#007AFF] sm:text-sm">
                  {event.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500 sm:mt-1 sm:text-xs">
                  <LuClock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{" "}
                  {format(event.date as Date, "HH:mm")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
