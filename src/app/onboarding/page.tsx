import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/src/components/ui/flow/onboarding-flow";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] p-6">
      <OnboardingFlow userName={session.user.name || "Aluno"} />
    </div>
  );
}
