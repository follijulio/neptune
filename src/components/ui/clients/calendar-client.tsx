"use client";

import { useMemo, useState } from "react";
import {
  LuAlignLeft,
  LuCalendarDays,
  LuCalendarPlus,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
} from "react-icons/lu";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createFullCalendarEventAction,
  deleteCalendarEventAction,
} from "@/src/app/actions/calendar-actions";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/shadcn-ui/dialog";
import { Input } from "@/src/components/shadcn-ui/input";
import { Textarea } from "@/src/components/shadcn-ui/textarea";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  date: Date | string;
};

function MonthNavigator({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  return (
    <div className="mx-auto mb-6 flex w-full max-w-xs items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-2 xl:mx-0">
      <Button
        variant="ghost"
        onClick={onPrevMonth}
        className="px-3 hover:bg-zinc-800"
      >
        <LuChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="w-40 truncate text-center text-lg font-bold text-[#E0E0E0] capitalize sm:w-48 sm:text-xl">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </h2>
      <Button
        variant="ghost"
        onClick={onNextMonth}
        className="px-3 hover:bg-zinc-800"
      >
        <LuChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

function CalendarDay({
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
  return (
    <div
      onClick={() => onDayClick(day)}
      className={`flex cursor-pointer flex-col gap-1.5 overflow-hidden border-r border-b border-[#1A1A1A] p-2 transition-colors hover:bg-zinc-900/80 ${!isSameMonth(day, currentMonth) ? "bg-black/60 text-zinc-700" : "bg-transparent text-zinc-300"} ${(idx + 1) % 7 === 0 ? "border-r-0" : ""} `}
    >
      <div className="mb-1 flex shrink-0 justify-end">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm ${isToday(day) ? "bg-[#007AFF] text-white shadow-[0_0_10px_rgba(0,122,255,0.5)]" : ""} `}
        >
          {format(day, "d")}
        </span>
      </div>

      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            onClick={(e) => onEventClick(e, event)}
            className="shrink-0 cursor-pointer truncate rounded-md border border-[#007AFF]/40 bg-[#007AFF]/20 px-2 py-1 text-[10px] font-semibold text-[#007AFF] shadow-sm transition-all hover:bg-[#007AFF]/40 sm:py-1.5 sm:text-xs"
            title={event.title}
          >
            <span className="mr-1 opacity-75">
              {format(event.date as Date, "HH:mm")}
            </span>
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarGrid({
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
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="custom-scrollbar overflow-x-auto pb-4">
      <div className="min-w-200 overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] shadow-2xl">
        <div className="grid grid-cols-7 border-b border-[#1A1A1A] bg-[#121212]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-bold tracking-wider text-zinc-500 uppercase sm:text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid auto-rows-[120px] grid-cols-7 sm:auto-rows-[140px]">
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

function UpcomingEventsList({
  events,
  onEventClick,
}: {
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  return (
    <div className="sticky top-24 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 shadow-xl">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
        <LuCalendarDays className="text-[#007AFF]" />
        Eventos próximos
      </h3>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1A1A1A] py-6 text-center text-sm text-zinc-500">
          Nenhum evento agendado para os próximos dias.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div
              key={`side-${event.id}`}
              onClick={(e) => onEventClick(e, event)}
              className="group -m-2 flex cursor-pointer items-start gap-4 rounded-xl p-2 transition-colors hover:bg-zinc-900/50"
            >
              <div className="min-w-12.5 rounded-lg border border-[#1A1A1A] bg-[#121212] p-2 text-center transition-colors group-hover:border-[#007AFF]/50">
                <div className="text-[10px] font-bold text-[#007AFF] uppercase">
                  {format(event.date as Date, "MMM", { locale: ptBR })}
                </div>
                <div className="mt-1 text-lg leading-none font-bold text-white">
                  {format(event.date as Date, "dd")}
                </div>
              </div>
              <div className="flex flex-col pt-1">
                <span className="line-clamp-2 text-sm leading-tight font-bold text-[#E0E0E0] transition-colors group-hover:text-[#007AFF]">
                  {event.title}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <LuClock className="h-3 w-3" />{" "}
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

function CreateEventModal({
  isOpen,
  selectedDate,
  time,
  descCount,
  loading,
  error,
  onTimeChange,
  onDescCountChange,
  onSubmit,
  onOpenChange,
}: {
  isOpen: boolean;
  selectedDate: Date | undefined;
  time: string;
  descCount: number;
  loading: boolean;
  error: string | null;
  onTimeChange: (value: string) => void;
  onDescCountChange: (value: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#121212] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <LuCalendarPlus className="text-[#007AFF]" /> Novo Evento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 pt-4">
          {error && (
            <p className="text-sm font-medium text-[#FF3B30]">{error}</p>
          )}
          <div className="rounded-lg border border-zinc-800 bg-black/50 p-3 text-center text-sm font-medium text-zinc-300 capitalize">
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })
              : ""}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-semibold text-zinc-300">
                Título
              </label>
              <Input
                name="title"
                placeholder="Ex: Prova de Geometria"
                className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
              />
            </div>
            <div className="col-span-1 space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold text-zinc-300">
                <LuClock /> Hora
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:filter"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-300">
                Descrição
              </label>
              <span
                className={`text-xs ${descCount >= 100 ? "text-[#FF3B30]" : "text-zinc-500"}`}
              >
                {descCount}/100
              </span>
            </div>
            <Textarea
              name="description"
              maxLength={100}
              onChange={(e) => onDescCountChange(e.target.value.length)}
              placeholder="Anotações para o evento..."
              className="min-h-25 resize-none rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-4 h-12 w-full rounded-xl bg-[#007AFF] font-bold text-white hover:bg-[#005bb5]"
          >
            {loading ? "Salvando e Sincronizando..." : "Salvar Evento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventDetailsModal({
  isOpen,
  event,
  onOpenChange,
  onDelete,
  isDeleting,
}: {
  isOpen: boolean;
  event: CalendarEvent | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#121212] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 border-b border-[#1A1A1A] pb-4 text-xl font-bold text-[#E0E0E0]">
            <LuAlignLeft className="text-[#007AFF]" /> Detalhes do Evento
          </DialogTitle>
        </DialogHeader>

        {event && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="mb-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Título
              </h3>
              <p className="text-xl font-bold text-[#007AFF]">{event.title}</p>
            </div>

            <div className="flex gap-12 rounded-xl border border-[#1A1A1A] bg-black/30 p-4">
              <div>
                <h3 className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Data
                </h3>
                <p className="font-medium text-white capitalize">
                  {format(event.date as Date, "dd 'de' MMM, yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <h3 className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  <LuClock /> Hora
                </h3>
                <p className="font-medium text-white">
                  {format(event.date as Date, "HH:mm")}
                </p>
              </div>
            </div>

            {event.description && (
              <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Descrição
                </h3>
                <p className="rounded-xl border border-[#1A1A1A] bg-black/50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-[#1A1A1A] pt-6">
          <Button
            variant="ghost"
            onClick={() => event && onDelete(event.id)}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg text-[#FF3B30] transition-colors hover:bg-[#FF3B30] hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-lg text-white hover:bg-zinc-800"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarClient({
  initialEvents = [],
}: {
  initialEvents?: CalendarEvent[];
}) {
  const router = useRouter();

  const events = useMemo(
    () => initialEvents.map((ev) => ({ ...ev, date: new Date(ev.date) })),
    [initialEvents],
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState("14:00");
  const [descCount, setDescCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const today = startOfDay(new Date());
  const upcomingEvents = events
    .filter((event) => (event.date as Date) >= today)
    .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime())
    .slice(0, 5);

  function handleDayClick(day: Date) {
    setSelectedDate(day);
    setIsCreateModalOpen(true);
    setError(null);
  }

  async function handleDeleteEvent(eventId: string) {
    setIsDeleting(true);
    const result = await deleteCalendarEventAction(eventId);
    if (!result.error) {
      setSelectedEvent(null);
      router.refresh();
    } else {
      console.error(result.error);
    }
    setIsDeleting(false);
  }

  function handleEventClick(e: React.MouseEvent, event: CalendarEvent) {
    e.stopPropagation();
    setSelectedEvent(event);
  }

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDate) return;
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) {
      setError("O título é obrigatório.");
      setLoading(false);
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const finalDateTime = new Date(selectedDate);
    finalDateTime.setHours(hours, minutes, 0, 0);

    const result = await createFullCalendarEventAction({
      title,
      description,
      date: finalDateTime.toISOString(),
    });

    if (result.error) setError(result.error);
    else {
      setIsCreateModalOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <section>
      <header className="mb-2 flex justify-between border-[#1A1A1A] px-4">
        <MonthNavigator
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
          onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
        />
      </header>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="min-w-0 flex-1">
          <CalendarGrid
            calendarDays={calendarDays}
            currentMonth={currentMonth}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="mt-0 flex w-full flex-col gap-6 xl:mt-18 xl:w-80">
          <UpcomingEventsList
            events={upcomingEvents}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        selectedDate={selectedDate}
        time={time}
        descCount={descCount}
        loading={loading}
        error={error}
        onTimeChange={setTime}
        onDescCountChange={setDescCount}
        onSubmit={handleCreateEvent}
        onOpenChange={setIsCreateModalOpen}
      />

      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        isDeleting={isDeleting}
      />
    </section>
  );
}
