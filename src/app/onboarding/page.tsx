import { redirect } from "next/navigation";

import { auth } from "@/src/auth";
import OnboardingFlow from "@/src/components/ui/flow/onboarding-flow";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#000000] p-6">
      <OnboardingFlow userName={session.user.name || "Aluno"} />
    </div>
  );
}
