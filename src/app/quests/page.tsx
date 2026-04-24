import { Metadata } from "next";

import QuestsClient from "@/src/components/ui/clients/quest-client";

export const metadata: Metadata = {
  title: "Netuno - Treinamento",
};

export default function Page() {
  return <QuestsClient />;
}
