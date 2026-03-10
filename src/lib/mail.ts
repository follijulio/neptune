import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  console.log("Enviando e-mail de verificação para:", email);
  console.log("Token de verificação:", token);

  const mailOptions = {
    from: `"Netuno" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Acesso ao Netuno: Confirme a sua identidade",
    html: `
      <div style="background-color: #000000; padding: 60px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -1px;">
            Netuno
          </h1>
          <p style="color: #007AFF; font-size: 14px; font-weight: 600; margin-top: 4px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">
            Gestão Acadêmica
          </p>
          
          <p style="color: #E0E0E0; font-size: 16px; margin-bottom: 24px; text-align: left;">
            Olá,
          </p>
          <p style="color: #A0A0A0; font-size: 16px; margin-bottom: 32px; text-align: left;">
            O seu painel de controle para dominar o semestre está quase pronto.
            Aqui está seu código de verificação para acessar o Netuno:
          </p>
          <div style="display: block; padding: 16px; background-color: #111111; border: 1px solid #2A2A2A; border-radius: 12px; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 2px; text-align: center; user-select: all; -webkit-user-select: all; -moz-user-select: all;">
            ${token}
          </div>
          
          <hr style="border: none; border-top: 1px solid #1A1A1A; margin: 40px 0 20px 0;" />
          
          <p style="color: #555555; font-size: 12px; text-align: left; margin-top: 12px;">
            Se não pediu a criação desta conta, ignore esta mensagem.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { error: "Falha ao enviar e-mail de verificação." };
  }
}
