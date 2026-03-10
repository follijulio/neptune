import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/src/components/ui/flow/onboarding-flow";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6">
      <OnboardingFlow userName={session.user.name || "Aluno"} />
    </div>
  );
}
