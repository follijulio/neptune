import { Metadata } from "next";

import PomodoroClient from "@/src/components/ui/clients/pomodoro-client";

export const metadata: Metadata = {
  title: "Netuno - Pomodoro",
};

export default function Page() {
  return <PomodoroClient />;
}