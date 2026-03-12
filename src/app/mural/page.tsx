import { redirect } from "next/navigation";

import { findNotesAction } from "../actions/notes-actions";

import { auth } from "@/src/auth";
import MuralClient from "@/src/components/ui/clients/mural-client";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notes = await findNotesAction(session.user.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-0 sm:px-4">
      <MuralClient initialNotes={notes} />
    </div>
  );
}
