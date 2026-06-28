import { Metadata } from "next";
import { redirect } from "next/navigation";

import { findNotesAction } from "../actions/notes-actions";

import { auth } from "@/src/auth";
import MuralClient from "@/src/components/ui/clients/mural-client";

export const metadata: Metadata = {
  title: "Netuno - Mural",
};

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notes = await findNotesAction(session.user.id);

  return (
    <div>
      <MuralClient initialNotes={notes} />
    </div>
  );
}
