import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth();

  // Se não tiver logado ou não tiver ID, chuta pra tela de login
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
          <p>Carregando dashboard seguro...</p>
        </div>
      }
    >
      <DashboardClient userId={session.user.id} userName={session.user.name} />
    </Suspense>
  );
}
