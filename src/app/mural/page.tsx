import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { findNotesAction } from "../actions/notes-actions";
import MuralClient from "@/src/components/ui/clients/mural-client";

export default async function MuralPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }
  const notes = await findNotesAction(session.user.id);

  return <MuralClient initialNotes={notes} />;
}
