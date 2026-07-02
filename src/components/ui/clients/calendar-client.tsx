"use client";

import CalendarGrid from "../../calendar/calendar-grid";
import EventDetailsModal from "../../calendar/event-details-modal";
import EventFormModal from "../../calendar/event-form-modal";
import MonthNavigator from "../../calendar/month-navigator";
import UpcomingEventsList from "../../calendar/upcoming-eventsList";

import { CalendarEvent, useCalendar } from "@/src/hooks/use-calendar";

interface CalendarClientProps {
  initialEvents?: CalendarEvent[];
}

export default function CalendarClient({ initialEvents = [] }: CalendarClientProps) {
  const { state, actions, setters } = useCalendar(initialEvents);

  return (
    <section className="flex flex-col gap-2 sm:gap-2 lg:gap-2">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Calendário</h2>
      <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
        <div className="min-w-0 flex-1">
          <CalendarGrid
            calendarDays={state.calendarDays}
            currentMonth={state.currentMonth}
            events={state.events}
            onDayClick={actions.selectDay}
            onEventClick={actions.selectEvent}
            onEventDrop={actions.moveEvent}
          />
        </div>
        <aside className="flex w-full shrink-0 flex-col gap-4 sm:gap-6 xl:w-80">
          <MonthNavigator
            currentMonth={state.currentMonth}
            onPrevMonth={actions.prevMonth}
            onNextMonth={actions.nextMonth}
          />
          <UpcomingEventsList events={state.upcomingEvents} onEventClick={actions.selectEvent} />
        </aside>
      </div>

      <EventFormModal
        isOpen={state.isFormModalOpen}
        onOpenChange={setters.setIsFormModalOpen}
        selectedDate={state.selectedDate}
        time={state.time}
        descCount={state.descCount}
        loading={state.loading}
        error={state.error}
        editingEvent={state.editingEvent}
        onTimeChange={setters.setTime}
        onDescCountChange={setters.setDescCount}
        onSubmit={actions.saveEvent}
      />

      <EventDetailsModal
        isOpen={!!state.selectedEvent}
        event={state.selectedEvent}
        onOpenChange={(open) => !open && setters.setSelectedEvent(null)}
        onDelete={actions.deleteEvent}
        onEdit={actions.editEvent}
        isDeleting={state.isDeleting}
      />
    </section>
  );
}