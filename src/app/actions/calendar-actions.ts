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

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const dateStr = typeof data.date === "string" ? data.date : "";
  const color = typeof data.color === "string" ? data.color.trim() : undefined;

  if (!title || title.length > 255) {
    return { error: "Título inválido ou muito longo." };
  }

  if (description.length > 100) {
    return { error: "Descrição excede o limite de 100 caracteres." };
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return { error: "Data inválida." };
  }

  if (color && color.length > 20) {
    return { error: "Formato de cor inválido." };
  }

  try {
    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        date: parsedDate,
        userId: session.user.id,
        color,
      },
    });

    let googleId = null;

    if (session.accessToken) {
      const endDate = new Date(parsedDate);
      endDate.setHours(parsedDate.getHours() + 2);

      const eventColor = color ? color.substring(0, 2) : "11";

      const googleEvent = {
        summary: title,
        description: `${description}\n\nNetuno - Gerenciador de Estudos`,
        start: {
          dateTime: parsedDate.toISOString(),
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
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return {
      success: googleId
        ? "Evento criado no Netuno e sincronizado com o Google!"
        : "Evento criado apenas no Netuno.",
      internalId: newEvent.id,
      googleId: googleId,
    };
  } catch {
    return { error: "Erro ao salvar o evento." };
  }
}

export async function deleteCalendarEventAction(eventId: string) {
  const session = (await auth()) as CalendarActionSession | null;

  if (!session?.user?.id) return { error: "Não autorizado" };

  if (typeof eventId !== "string" || !eventId.trim()) {
    return { error: "ID de evento inválido." };
  }

  try {
    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, userId: session.user.id },
    });

    if (!event) return { error: "Evento não encontrado ou acesso negado." };

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
      where: { id: event.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: "Evento excluído com sucesso!" };
  } catch {
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

  if (!data || typeof data !== "object") {
    return { error: "Dados inválidos." };
  }

  const id = typeof data.id === "string" ? data.id.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const dateStr = typeof data.date === "string" ? data.date : "";
  const color = typeof data.color === "string" ? data.color.trim() : undefined;

  if (!id) return { error: "ID de evento inválido." };

  if (!title || title.length > 255) {
    return { error: "Título inválido ou muito longo." };
  }

  if (description.length > 100) {
    return { error: "Descrição excede o limite de 100 caracteres." };
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return { error: "Data inválida." };
  }

  if (color && color.length > 20) {
    return { error: "Formato de cor inválido." };
  }

  try {
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: id, userId: session.user.id },
    });

    if (!existingEvent)
      return { error: "Evento não encontrado ou acesso negado." };

    await prisma.calendarEvent.update({
      where: { id: existingEvent.id },
      data: {
        title,
        description,
        date: parsedDate,
        color,
      },
    });

    if (existingEvent.googleEventId && session.accessToken) {
      const endDate = new Date(parsedDate);
      endDate.setHours(parsedDate.getHours() + 2);

      const eventColor = color ? color.substring(0, 2) : "11";

      const googleEvent = {
        summary: title,
        description: `${description}\n\nNetuno - Gerenciador de Estudos`,
        start: {
          dateTime: parsedDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        colorId: eventColor,
      };

      await fetch(
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
    }

    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: "Evento atualizado com sucesso!" };
  } catch {
    return { error: "Erro ao atualizar o evento." };
  }
}
