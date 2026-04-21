"use server";

import { endOfMonth, startOfMonth } from "date-fns";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

export async function saveStudySessionAction(
  minutes: number,
  mode: "focus" | "timer",
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  const xpGained = minutes * 15;

  try {
    await prisma.$transaction([
      prisma.studySession.create({
        data: {
          duration: minutes,
          mode: mode.toUpperCase(),
          userId: session.user.id,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: xpGained } },
      }),
    ]);
    return { success: true, xpGained };
  } catch (e) {
    return { error: "Erro ao salvar sessão" };
  }
}

export async function getMonthlyStudyTimeAction() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const now = new Date();
  const total = await prisma.studySession.aggregate({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startOfMonth(now),
        lte: endOfMonth(now),
      },
    },
    _sum: { duration: true },
  });

  return total._sum.duration || 0;
}

export async function getLeaderboardAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
      },
    });
    return { success: true, leaderboard: users };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao buscar o ranking global." };
  }
}
