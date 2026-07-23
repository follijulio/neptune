"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { taskSchema, updateTaskOrderSchema } from "@/src/schemas/task-schema";

export async function getTasksAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  return prisma.task.findMany({
    where: { userId: session.user.id },
    include: { subtasks: true },
    orderBy: { order: "asc" },
  });
}

export async function createTaskAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const parsed = taskSchema.parse(data);

  const task = await prisma.task.create({
    data: {
      ...parsed,
      userId: session.user.id,
      subtasks: {
        create: parsed.subtasks,
      },
    },
  });

  revalidatePath("/quests"); // Ajuste para a rota onde o Kanban ficará
  return task;
}

export async function updateTaskOrdersAction(tasks: unknown[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const parsedTasks = tasks.map((t) => updateTaskOrderSchema.parse(t));

  await prisma.$transaction(
    parsedTasks.map((task) =>
      prisma.task.update({
        where: { id: task.id, userId: session.user?.id },
        data: { category: task.category, order: task.order },
      }),
    ),
  );

  revalidatePath("/quests");
}

export async function deleteTaskAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  await prisma.task.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/quests");
}
