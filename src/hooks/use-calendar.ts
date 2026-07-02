import { useEffect, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useRouter } from "next/navigation";

import {
  createFullCalendarEventAction,
  deleteCalendarEventAction,
  updateFullCalendarEventAction,
} from "@/src/app/actions/calendar-actions";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  date: Date | string;
  color?: string | null;
};

export function useCalendar(initialEvents: CalendarEvent[] = []) {
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    //! vai ficar dando erro mesmo, não sei como fazer isso sem erro...

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents(initialEvents.map((ev) => ({ ...ev, date: new Date(ev.date) })));
  }, [initialEvents]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [formState, setFormState] = useState({
    time: "14:00",
    descCount: 0,
    loading: false,
    error: null as string | null,
    isDeleting: false,
  });

  const monthStart = startOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart)),
  });
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= startOfDay(new Date()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const actions = {
    nextMonth: () => setCurrentMonth(addMonths(currentMonth, 1)),
    prevMonth: () => setCurrentMonth(subMonths(currentMonth, 1)),
    selectDay: (day: Date) => {
      setSelectedDate(day);
      setEditingEvent(null);
      setFormState((prev) => ({
        ...prev,
        //TODO: deixar o usuário escolher o horário, por enquanto é fixo
        //?     tem um input no componente, não implementei de bobo
        //TODO: puxar o input
        time: "14:00",
        descCount: 0,
        error: null,
      }));
      setIsFormModalOpen(true);
    },
    selectEvent: (e: React.MouseEvent, event: CalendarEvent) => {
      e.stopPropagation();
      setSelectedEvent(event);
    },
    editEvent: (event: CalendarEvent) => {
      setSelectedEvent(null);
      setEditingEvent(event);
      setSelectedDate(new Date(event.date));
      const dateObj = new Date(event.date);
      const timeStr = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
      setFormState((prev) => ({
        ...prev,
        time: timeStr,
        descCount: event.description?.length || 0,
        error: null,
      }));
      setIsFormModalOpen(true);
    },
    deleteEvent: async (eventId: string) => {
      setFormState((prev) => ({ ...prev, isDeleting: true }));
      const result = await deleteCalendarEventAction(eventId);
      if (!result.error) {
        setSelectedEvent(null);
        router.refresh();
      } else {
        console.error(result.error);
      }
      setFormState((prev) => ({ ...prev, isDeleting: false }));
    },
    saveEvent: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedDate) return;

      setFormState((prev) => ({ ...prev, loading: true, error: null }));

      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      if (!title) {
        setFormState((prev) => ({
          ...prev,
          error: "O título é obrigatório.",
          loading: false,
        }));
        return;
      }

      const [hours, minutes] = formState.time.split(":").map(Number);
      const finalDateTime = new Date(selectedDate);
      finalDateTime.setHours(hours, minutes, 0, 0);

      const result = editingEvent
        ? await updateFullCalendarEventAction({
            id: editingEvent.id,
            title,
            description,
            date: finalDateTime.toISOString(),
            color: editingEvent.color || undefined,
          })
        : await createFullCalendarEventAction({
            title,
            description,
            date: finalDateTime.toISOString(),
          });

      if (result.error) {
        setFormState((prev) => ({
          ...prev,
          error: result.error,
          loading: false,
        }));
      } else {
        setIsFormModalOpen(false);
        setEditingEvent(null);
        setFormState((prev) => ({ ...prev, loading: false }));
        router.refresh();
      }
    },
    moveEvent: async (eventId: string, newDate: Date) => {
      //? atualiza na interface, depois o banco, tem que ver uma jeito mais bonitinho de fazer isso...
      //TODO: Pesquisar sobre otimização de performance para não precisar atualizar o banco de dados toda vez que arrastar um evento, talvez usar debonce ou algo do tipo.
      const eventToMove = events.find((e) => e.id === eventId);
      if (!eventToMove) return;

      const originalDate = new Date(eventToMove.date);
      newDate.setHours(originalDate.getHours(), originalDate.getMinutes());

      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, date: newDate } : ev)),
      );

      await updateFullCalendarEventAction({
        id: eventToMove.id,
        title: eventToMove.title,
        description: eventToMove.description || "",
        date: newDate.toISOString(),
        color: eventToMove.color || undefined,
      });

      router.refresh();
    },
  };

  const setters = {
    setIsFormModalOpen,
    setSelectedEvent,
    setTime: (time: string) => setFormState((prev) => ({ ...prev, time })),
    setDescCount: (descCount: number) =>
      setFormState((prev) => ({ ...prev, descCount })),
  };

  return {
    state: {
      events,
      currentMonth,
      selectedDate,
      isFormModalOpen,
      selectedEvent,
      editingEvent,
      calendarDays,
      upcomingEvents,
      ...formState,
    },
    actions,
    setters,
  };
}
