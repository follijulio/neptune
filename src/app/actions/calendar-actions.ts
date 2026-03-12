"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

interface CalendarActionSession {
  user?: {
    id?: string | null;
  } | null;
  accessToken?: string | null;
}

interface GoogleCalendarEventResponse {
  id: string;
}

export async function createFullCalendarEventAction(data: {
  title: string;
  description: string;
  date: string;
  color?: string;
}) {
  const session = (await auth()) as CalendarActionSession | null;

  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const newEvent = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description.substring(0, 100),
        date: new Date(data.date),
        userId: session.user.id,
        color: data.color,
      },
    });

    let googleId = null;

    if (session.accessToken) {
      const startDate = new Date(data.date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 2);

      const eventColor = data.color ? data.color.substring(0, 2) : "11";

      const googleEvent = {
        summary: data.title,
        description: `${data.description}\n\nNetuno - Gerenciador de Estudos`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        colorId: eventColor,
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleEvent),
        },
      );

      if (response.ok) {
        const result: GoogleCalendarEventResponse = await response.json();
        googleId = result.id;

        await prisma.calendarEvent.update({
          where: { id: newEvent.id },
          data: { googleEventId: googleId },
        });
      } else {
        console.error("Erro na API do Google:", await response.text());
      }
    }

    return {
      success: googleId
        ? "Evento criado no Netuno e sincronizado com o Google!"
        : "Evento criado apenas no Netuno.",
      internalId: newEvent.id,
      googleId: googleId,
    };
  } catch (error) {
    console.error("Erro interno:", error);
    return { error: "Erro ao salvar o evento." };
  }
}

export async function deleteCalendarEventAction(eventId: string) {
  const session = (await auth()) as CalendarActionSession | null;

  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId, userId: session.user.id },
    });

    if (!event) return { error: "Evento não encontrado." };

    if (event.googleEventId && session.accessToken) {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.googleEventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return { success: "Evento excluído com sucesso!" };
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    return { error: "Erro interno ao excluir o evento." };
  }
}

export async function updateFullCalendarEventAction(data: {
  id: string;
  title: string;
  description: string;
  date: string;
  color?: string;
}) {
  const session = (await auth()) as CalendarActionSession | null;

  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: data.id, userId: session.user.id },
    });

    if (!existingEvent) return { error: "Evento não encontrado." };

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description.substring(0, 100),
        date: new Date(data.date),
        color: data.color,
      },
    });

    if (existingEvent.googleEventId && session.accessToken) {
      const startDate = new Date(data.date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 2);

      const eventColor = data.color ? data.color.substring(0, 2) : "11";

      const googleEvent = {
        summary: data.title,
        description: `${data.description}\n\nNetuno - Gerenciador de Estudos`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        colorId: eventColor,
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEvent.googleEventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleEvent),
        },
      );

      if (!response.ok) {
        console.error(
          "Erro na API do Google ao atualizar:",
          await response.text(),
        );
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    
    return { success: "Evento atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro interno ao atualizar:", error);
    return { error: "Erro ao atualizar o evento." };
  }
}
