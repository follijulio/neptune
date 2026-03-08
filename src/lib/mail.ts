import { Resend } from "resend";
import TwoFactorEmail from "../components/ui/two-factor-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTwoFactorEmail(email: string, token: string) {
  await resend.emails.send({
    from: "Neptune Segurança <onboarding@resend.dev>",
    to: email,
    subject: "Seu código de segurança - Neptune",
    react: TwoFactorEmail({ token }),
  });
}
