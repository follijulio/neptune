"use client";

import { useMemo, useState } from "react";
import {
  LuAlignLeft,
  LuCalendarDays,
  LuCalendarPlus,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuPencil,
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
  updateFullCalendarEventAction,
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
  color?: string | null;
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
  const monthName = useMemo(
    () => format(currentMonth, "MMMM yyyy", { locale: ptBR }),
    [currentMonth],
  );

  return (
    <div className="mx-auto mb-4 flex w-full max-w-70 items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-1.5 sm:max-w-xs sm:p-2 xl:mx-0">
      <Button
        variant="ghost"
        onClick={onPrevMonth}
        className="h-8 px-2 hover:bg-zinc-800 sm:h-10 sm:px-3"
      >
        <LuChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <h2 className="w-32 truncate text-center text-base font-bold text-[#E0E0E0] capitalize sm:w-40 sm:w-48 sm:text-lg sm:text-xl">
        {monthName}
      </h2>
      <Button
        variant="ghost"
        onClick={onNextMonth}
        className="h-8 px-2 hover:bg-zinc-800 sm:h-10 sm:px-3"
      >
        <LuChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:h-7 sm:w-6 sm:w-7 sm:text-sm sm:text-xs ${isTodayDate ? "bg-[#007AFF] text-white shadow-[0_0_10px_rgba(0,122,255,0.5)]" : ""} `}
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
              className="py-2 text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase sm:py-3 sm:text-sm sm:text-xs"
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

function UpcomingEventsList({
  events,
  onEventClick,
}: {
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}) {
  return (
    <div className="sticky top-20 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 shadow-xl sm:top-24 sm:rounded-2xl sm:p-6">
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

function EventFormModal({
  isOpen,
  selectedDate,
  time,
  descCount,
  loading,
  error,
  editingEvent,
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
  editingEvent: CalendarEvent | null;
  onTimeChange: (value: string) => void;
  onDescCountChange: (value: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const formattedDate = useMemo(() => {
    return selectedDate
      ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : "";
  }, [selectedDate]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-100 rounded-2xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <LuCalendarPlus className="text-[#007AFF]" />
            {editingEvent ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="space-y-4 pt-2 sm:space-y-5 sm:pt-4"
        >
          {error && (
            <p className="text-xs font-medium text-[#FF3B30] sm:text-sm">
              {error}
            </p>
          )}
          <div className="rounded-lg border border-zinc-800 bg-black/50 p-2 text-center text-xs font-medium text-zinc-300 capitalize sm:p-3 sm:text-sm">
            {formattedDate}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="col-span-2 space-y-1.5 sm:space-y-2">
              <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                Título
              </label>
              <Input
                name="title"
                defaultValue={editingEvent?.title || ""}
                placeholder="Ex: Prova de Geometria"
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
              />
            </div>
            <div className="col-span-1 space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-zinc-300 sm:text-sm">
                <LuClock className="hidden sm:block" /> Hora
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:filter"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                Descrição
              </label>
              <span
                className={`text-[10px] sm:text-xs ${descCount >= 100 ? "text-[#FF3B30]" : "text-zinc-500"}`}
              >
                {descCount}/100
              </span>
            </div>
            <Textarea
              name="description"
              maxLength={100}
              defaultValue={editingEvent?.description || ""}
              onChange={(e) => onDescCountChange(e.target.value.length)}
              placeholder="Anotações para o evento..."
              className="min-h-20 resize-none rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:min-h-25 sm:text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 w-full rounded-xl bg-[#007AFF] text-sm font-bold text-white hover:bg-[#005bb5] sm:mt-4 sm:h-12 sm:text-base"
          >
            {loading
              ? "Processando..."
              : editingEvent
                ? "Salvar Alterações"
                : "Salvar Evento"}
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
  onEdit,
  isDeleting,
}: {
  isOpen: boolean;
  event: CalendarEvent | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (event: CalendarEvent) => void;
  isDeleting: boolean;
}) {
  const formattedDate = useMemo(() => {
    return event?.date
      ? format(event.date as Date, "dd 'de' MMM, yyyy", { locale: ptBR })
      : "";
  }, [event]);

  const formattedTime = useMemo(() => {
    return event?.date ? format(event.date as Date, "HH:mm") : "";
  }, [event]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-100 rounded-2xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 border-b border-[#1A1A1A] pb-3 text-lg font-bold text-[#E0E0E0] sm:pb-4 sm:text-xl">
            <LuAlignLeft className="text-[#007AFF]" /> Detalhes do Evento
          </DialogTitle>
        </DialogHeader>

        {event && (
          <div className="space-y-4 pt-2 sm:space-y-6">
            <div>
              <h3 className="mb-0.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-1 sm:text-xs">
                Título
              </h3>
              <p className="text-lg font-bold text-[#007AFF] sm:text-xl">
                {event.title}
              </p>
            </div>

            <div className="flex gap-6 rounded-xl border border-[#1A1A1A] bg-black/30 p-3 sm:gap-12 sm:p-4">
              <div>
                <h3 className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-1 sm:text-xs">
                  Data
                </h3>
                <p className="text-sm font-medium text-white capitalize sm:text-base">
                  {formattedDate}
                </p>
              </div>
              <div>
                <h3 className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-1 sm:text-xs">
                  <LuClock className="hidden sm:block" /> Hora
                </h3>
                <p className="text-sm font-medium text-white sm:text-base">
                  {formattedTime}
                </p>
              </div>
            </div>

            {event.description && (
              <div>
                <h3 className="mb-1.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-2 sm:text-xs">
                  Descrição
                </h3>
                <p className="rounded-xl border border-[#1A1A1A] bg-black/50 p-3 text-xs leading-relaxed whitespace-pre-wrap text-zinc-300 sm:p-4 sm:text-sm">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-[#1A1A1A] pt-4 sm:pt-6">
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => event && onDelete(event.id)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-lg px-2 text-xs text-[#FF3B30] transition-colors hover:bg-[#FF3B30] hover:text-white sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">
                {isDeleting ? "A excluir..." : "Excluir"}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => event && onEdit(event)}
              className="flex items-center gap-1.5 rounded-lg px-2 text-xs text-[#007AFF] transition-colors hover:bg-[#007AFF] hover:text-white sm:gap-2 sm:px-4 sm:text-sm"
            >
              <LuPencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-3 text-xs text-white hover:bg-zinc-800 sm:px-4 sm:text-sm"
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
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState("14:00");
  const [descCount, setDescCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
  const startDate = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const endDate = useMemo(() => endOfWeek(monthEnd), [monthEnd]);
  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate],
  );

  const today = useMemo(() => startOfDay(new Date()), []);
  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => (event.date as Date) >= today)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime())
      .slice(0, 5);
  }, [events, today]);

  function handleDayClick(day: Date) {
    setSelectedDate(day);
    setEditingEvent(null);
    setTime("14:00");
    setDescCount(0);
    setIsFormModalOpen(true);
    setError(null);
  }

  function handleEditClick(event: CalendarEvent) {
    setSelectedEvent(null);
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setTime(format(new Date(event.date), "HH:mm"));
    setDescCount(event.description?.length || 0);
    setIsFormModalOpen(true);
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

  async function handleSaveEvent(e: React.FormEvent<HTMLFormElement>) {
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

    let result;

    if (editingEvent) {
      result = await updateFullCalendarEventAction({
        id: editingEvent.id,
        title,
        description,
        date: finalDateTime.toISOString(),
        color: editingEvent.color || undefined,
      });
    } else {
      result = await createFullCalendarEventAction({
        title,
        description,
        date: finalDateTime.toISOString(),
      });
    }

    if (result.error) {
      setError(result.error);
    } else {
      setIsFormModalOpen(false);
      setEditingEvent(null);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <section className="px-2 sm:px-0">
      <header className="mb-2 flex justify-center border-[#1A1A1A] px-2 sm:justify-between sm:px-4">
        <MonthNavigator
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
          onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
        />
      </header>
      <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
        <div className="min-w-0 flex-1">
          <CalendarGrid
            calendarDays={calendarDays}
            currentMonth={currentMonth}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 sm:gap-6 xl:mt-18 xl:w-80">
          <UpcomingEventsList
            events={upcomingEvents}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      <EventFormModal
        isOpen={isFormModalOpen}
        selectedDate={selectedDate}
        time={time}
        descCount={descCount}
        loading={loading}
        error={error}
        editingEvent={editingEvent}
        onTimeChange={setTime}
        onDescCountChange={setDescCount}
        onSubmit={handleSaveEvent}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) setEditingEvent(null);
        }}
      />

      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onEdit={handleEditClick}
        isDeleting={isDeleting}
      />
    </section>
  );
}
