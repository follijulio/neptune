import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getTasksAction } from "../actions/task-actions";

import { auth } from "@/src/auth";
import { KanbanClient} from "@/src/components/ui/clients/kanban-client";

export const metadata: Metadata = {
  title: "Netuno - Kanban",
};

export default async function Page() {
  const session = await auth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: any = await getTasksAction();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#000000] p-4 sm:p-6">
      <KanbanClient initialTasks={tasks} />
    </div>
  );
}
