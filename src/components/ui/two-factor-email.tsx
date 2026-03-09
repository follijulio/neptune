import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TwoFactorEmailProps {
  token: string;
}

export default function TwoFactorEmail({ token }: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Seu código de acesso do Neptune: {token}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Neptune</Heading>
          <Text style={text}>Olá,</Text>
          <Text style={text}>
            Você solicitou acesso ao seu dashboard acadêmico. Use o código de 6
            dígitos abaixo para autenticar sua conta.
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{token}</Text>
          </Section>
          <Text style={text}>
            Este código expira em 5 minutos. Se você não solicitou este acesso,
            pode ignorar este e-mail com segurança.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#000000",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#121212",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "12px",
  border: "1px solid #1A1A1A",
  maxWidth: "500px",
};

const h1 = {
  color: "#007AFF",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 30px 0",
};

const text = {
  color: "#888888",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
};

const codeContainer = {
  background: "#000000",
  borderRadius: "8px",
  border: "1px solid #1A1A1A",
  margin: "32px 0",
  padding: "24px 0",
};

const code = {
  color: "#E0E0E0",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "12px",
  textAlign: "center" as const,
  margin: "0",
};
