/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

export async function createFullCalendarEventAction(data: {
  title: string;
  description: string;
  date: string; // Vem do frontend no formato ISO
}) {
  const session: any = await auth();

  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    // banco
    const newEvent = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description.substring(0, 100),
        date: new Date(data.date),
        userId: session.user.id,
      },
    });

    // se tiver google adiciona, senão, só banco
    if (session.accessToken) {
      const startDate = new Date(data.date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 2);

      const redColor = "11";
      const googleEvent = {
        summary: data.title,
        description: `${data.description}\n\nGerado pelo Netuno`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: { dateTime: endDate.toISOString(), timeZone: "America/Sao_Paulo" },
        colorId: redColor,
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
        const result = await response.json();
        await prisma.calendarEvent.update({
          where: { id: newEvent.id },
          data: { googleEventId: result.id },
        });
      }
    }

    revalidatePath("/calendar");
    return { success: "Evento criado no Netuno e sincronizado com o Google!" };
  } catch (error) {
    console.error("Erro interno:", error);
    return { error: "Erro ao salvar o evento." };
  }
}

export async function deleteCalendarEventAction(eventId: string) {
  const session: any = await auth();

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

    revalidatePath("/calendar");
    return { success: "Evento excluído com sucesso!" };
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    return { error: "Erro interno ao excluir o evento." };
  }
}
