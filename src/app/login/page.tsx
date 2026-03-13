import { Metadata } from "next";

import LoginClient from "@/src/components/ui/clients/login-client";

export const metadata: Metadata = {
  title: "Netuno - Login",
};

export default function Page() {
  return <LoginClient />;
}
