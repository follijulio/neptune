"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/src/components/shadcn-ui/button";
import { Input } from "@/src/components/shadcn-ui/input";
import { Textarea } from "@/src/components/shadcn-ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/shadcn-ui/dialog";
import {
  createFullCalendarEventAction,
  deleteCalendarEventAction,
} from "@/src/app/actions/calendar-actions";
import {
  LuCalendarPlus,
  LuClock,
  LuChevronLeft,
  LuChevronRight,
  LuCalendarDays,
  LuAlignLeft,
} from "react-icons/lu";
import MainLayout from "../main-layout";
import { Trash2 } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  date: Date | string;
};

// ==================== Componente: MonthNavigator ====================
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
    <div className="flex justify-between items-center mb-6 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-2 w-full max-w-xs mx-auto xl:mx-0">
      <Button
        variant="ghost"
        onClick={onPrevMonth}
        className="hover:bg-zinc-800 px-3"
      >
        <LuChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-lg sm:text-xl font-bold w-40 sm:w-48 text-center capitalize text-[#E0E0E0] truncate">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </h2>
      <Button
        variant="ghost"
        onClick={onNextMonth}
        className="hover:bg-zinc-800 px-3"
      >
        <LuChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

// ==================== Componente: CalendarDay ====================
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
      className={`border-r border-b border-[#1A1A1A] p-2 transition-colors cursor-pointer hover:bg-zinc-900/80 flex flex-col gap-1.5 overflow-hidden
        ${!isSameMonth(day, currentMonth) ? "bg-black/60 text-zinc-700" : "bg-transparent text-zinc-300"}
        ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}
      `}
    >
      <div className="flex justify-end mb-1 shrink-0">
        <span
          className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full
          ${isToday(day) ? "bg-[#007AFF] text-white shadow-[0_0_10px_rgba(0,122,255,0.5)]" : ""}
        `}
        >
          {format(day, "d")}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pr-1 custom-scrollbar">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            onClick={(e) => onEventClick(e, event)}
            className="shrink-0 bg-[#007AFF]/20 border border-[#007AFF]/40 text-[#007AFF] text-[10px] sm:text-xs font-semibold px-2 py-1 sm:py-1.5 rounded-md truncate shadow-sm hover:bg-[#007AFF]/40 transition-all cursor-pointer"
            title={event.title}
          >
            <span className="opacity-75 mr-1">
              {format(event.date as Date, "HH:mm")}
            </span>
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Componente: CalendarGrid ====================
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
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-200 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-[#1A1A1A] bg-[#121212]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px] sm:auto-rows-[140px]">
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

// ==================== Componente: UpcomingEventsList ====================
function UpcomingEventsList({
  events,
  onEventClick,
}: {
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl sticky top-24">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <LuCalendarDays className="text-[#007AFF]" />
        Eventos próximos
      </h3>

      {events.length === 0 ? (
        <div className="text-zinc-500 text-sm text-center py-6 border border-dashed border-[#1A1A1A] rounded-xl">
          Nenhum evento agendado para os próximos dias.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div
              key={`side-${event.id}`}
              onClick={(e) => onEventClick(e, event)}
              className="flex gap-4 items-start group cursor-pointer hover:bg-zinc-900/50 p-2 -m-2 rounded-xl transition-colors"
            >
              <div className="bg-[#121212] border border-[#1A1A1A] rounded-lg p-2 text-center min-w-12.5 group-hover:border-[#007AFF]/50 transition-colors">
                <div className="text-[10px] font-bold text-[#007AFF] uppercase">
                  {format(event.date as Date, "MMM", { locale: ptBR })}
                </div>
                <div className="text-lg font-bold text-white leading-none mt-1">
                  {format(event.date as Date, "dd")}
                </div>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-sm font-bold text-[#E0E0E0] leading-tight line-clamp-2 group-hover:text-[#007AFF] transition-colors">
                  {event.title}
                </span>
                <span className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
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
      <DialogContent className="bg-[#121212] border-[#1A1A1A] text-white sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <LuCalendarPlus className="text-[#007AFF]" /> Novo Evento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 pt-4">
          {error && (
            <p className="text-[#FF3B30] text-sm font-medium">{error}</p>
          )}
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-medium text-center capitalize">
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
                className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
              />
            </div>
            <div className="col-span-1 space-y-2">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-1">
                <LuClock /> Hora
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
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
              className="bg-zinc-900/50 border-zinc-800 text-white min-h-25 rounded-xl focus-visible:ring-[#007AFF] resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007AFF] hover:bg-[#005bb5] text-white font-bold h-12 rounded-xl mt-4"
          >
            {loading ? "Salvando e Sincronizando..." : "Salvar Evento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Componente: EventDetailsModal ====================
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
      <DialogContent className="bg-[#121212] border-[#1A1A1A] text-white sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E0E0E0] border-b border-[#1A1A1A] pb-4 flex items-center gap-2">
            <LuAlignLeft className="text-[#007AFF]" /> Detalhes do Evento
          </DialogTitle>
        </DialogHeader>

        {event && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Título
              </h3>
              <p className="text-xl font-bold text-[#007AFF]">{event.title}</p>
            </div>

            <div className="flex gap-12 bg-black/30 p-4 rounded-xl border border-[#1A1A1A]">
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  Data
                </h3>
                <p className="text-white font-medium capitalize">
                  {format(event.date as Date, "dd 'de' MMM, yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <LuClock /> Hora
                </h3>
                <p className="text-white font-medium">
                  {format(event.date as Date, "HH:mm")}
                </p>
              </div>
            </div>

            {event.description && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Descrição
                </h3>
                <p className="text-zinc-300 bg-black/50 p-4 rounded-xl border border-[#1A1A1A] whitespace-pre-wrap text-sm leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-6 mt-2 border-t border-[#1A1A1A]">
          <Button
            variant="ghost"
            onClick={() => event && onDelete(event.id)}
            disabled={isDeleting}
            className="text-[#FF3B30] hover:text-white hover:bg-[#FF3B30] rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-zinc-800 text-white rounded-lg"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Componente Principal ====================
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
    <MainLayout>
      <header className="mb-2 border-[#1A1A1A] flex justify-between px-4">
        <MonthNavigator
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
          onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
        />
      </header>
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <CalendarGrid
            calendarDays={calendarDays}
            currentMonth={currentMonth}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-6 mt-0 xl:mt-18">
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
    </MainLayout>
  );
}
