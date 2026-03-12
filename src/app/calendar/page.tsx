import { redirect } from "next/navigation";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import CalendarClient from "@/src/components/ui/clients/calendar-client";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const events = await prisma.calendarEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="mx-auto w-full px-0 sm:px-4">
      <CalendarClient initialEvents={events} />
    </div>
  );
}
