"use client";

import { useState } from "react";
import { IoAlertCircleOutline } from "react-icons/io5";
import { LuHexagon } from "react-icons/lu";

import {
  loginAction,
  loginWithGoogleAction,
  registerAction,
} from "../actions/auth-action";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/components/shadcn-ui/alert";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/shadcn-ui/card";
import { Input } from "@/src/components/shadcn-ui/input";
import { Label } from "@/src/components/shadcn-ui/label";

type AuthView = "login" | "register";

export default function Page() {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined | null>("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!showTwoFactor) {
      setEmail(formData.get("email") as string);
      setPassword(formData.get("password") as string);
    }

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.twoFactor) {
      setShowTwoFactor(true);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const switchView = (view: AuthView) => {
    setCurrentView(view);
    setError(null);
    setShowTwoFactor(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-12 bg-[#000000] p-6 lg:flex-row lg:gap-32 lg:p-24">
      <div className="flex w-full max-w-100 flex-col items-center text-center lg:items-start lg:text-left">
        <LuHexagon className="mb-6 text-7xl text-[#007AFF] lg:text-8xl" />
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#E0E0E0] lg:text-6xl">
          Netuno
        </h1>
        <p className="mb-12 text-lg leading-relaxed text-[#888888] lg:text-xl">
          Seu dashboard acadêmico inteligente. Domine as disciplinas da
          Licenciatura e otimize sua rotina universitária com dados.{" "}
          <span className="text-xs">
            Desenvolvido por{" "}
            <a
              href="https://github.com/follijulio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007AFF] hover:underline"
            >
              folli
            </a>
          </span>
        </p>
        <div className="grid h-14 w-full grid-cols-2 rounded-xl bg-[#121212] p-1.5">
          <button
            onClick={() => switchView("login")}
            className={`flex h-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 ${
              currentView === "login"
                ? "bg-[#1A1A1A] text-[#E0E0E0]"
                : "bg-transparent text-[#888888] hover:text-[#E0E0E0]"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => switchView("register")}
            className={`flex h-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 ${
              currentView === "register"
                ? "bg-[#1A1A1A] text-[#E0E0E0]"
                : "bg-transparent text-[#888888] hover:text-[#E0E0E0]"
            }`}
          >
            Cadastrar
          </button>
        </div>
      </div>

      <div className="w-full max-w-112.5">
        {currentView === "login" && (
          <div className="animate-in fade-in zoom-in-95 duration-300 ease-out">
            <Card className="rounded-2xl border-0 bg-[#121212] p-8 text-[#E0E0E0] shadow-none">
              <CardHeader className="mb-8 space-y-2 p-0">
                <CardTitle className="text-2xl font-bold tracking-wide">
                  {showTwoFactor
                    ? "Verificação de Segurança"
                    : "Bem-vindo de volta"}
                </CardTitle>
                <CardDescription className="text-base text-[#888888]">
                  {showTwoFactor
                    ? "Enviamos um código de 6 dígitos para o seu e-mail."
                    : "Insira suas credenciais para acessar seu painel."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <Alert className="mb-6 border-[#FF3B30]/20 bg-[#FF3B30]/10 text-[#FF3B30]">
                    <IoAlertCircleOutline className="h-4 w-4 stroke-[#FF3B30]" />
                    <AlertTitle>Erro na autenticação</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {showTwoFactor ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="password" value={password} />

                    <div className="space-y-3">
                      <Input
                        name="code"
                        maxLength={6}
                        placeholder="000000"
                        required
                        autoComplete="off"
                        className="h-14 rounded-lg border border-[#1A1A1A] bg-[#000000] px-4 text-center text-2xl font-bold tracking-[1em] text-[#E0E0E0] transition-all focus-visible:border-[#007AFF] focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-8 h-12 w-full rounded-lg bg-[#007AFF] text-base font-bold text-white transition-colors hover:bg-[#007AFF]/80"
                    >
                      {isLoading ? "Verificando..." : "Confirmar Código"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowTwoFactor(false)}
                      className="mt-4 w-full text-sm text-[#888888] transition-colors hover:text-[#E0E0E0]"
                    >
                      Voltar para o login normal
                    </button>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-[#888888]"
                        >
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="folli@exemplo.com"
                          required
                          defaultValue={email}
                          className="h-12 rounded-lg border border-[#1A1A1A] bg-[#000000] px-4 text-[#E0E0E0] transition-all focus-visible:border-[#007AFF] focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="password"
                            className="text-sm font-medium text-[#888888]"
                          >
                            Senha
                          </Label>
                          <a
                            href="#"
                            className="text-sm text-[#007AFF] transition-colors hover:underline"
                          >
                            Esqueceu a senha?
                          </a>
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          defaultValue={password}
                          className="h-12 rounded-lg border border-[#1A1A1A] bg-[#000000] px-4 text-[#E0E0E0] transition-all focus-visible:border-[#007AFF] focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="mt-8 h-12 w-full rounded-lg bg-[#E0E0E0] text-base font-bold text-[#000000] transition-colors hover:bg-[#CCCCCC]"
                      >
                        {isLoading ? "Autenticando..." : "Entrar na plataforma"}
                      </Button>
                    </form>
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-[#1A1A1A]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[#121212] px-2 text-[#888888]">
                            Ou continue com
                          </span>
                        </div>
                      </div>

                      <form action={loginWithGoogleAction} className="mt-6">
                        <Button
                          type="submit"
                          variant="outline"
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#1A1A1A] bg-transparent font-medium text-[#E0E0E0] transition-colors hover:bg-[#1A1A1A] hover:text-white"
                        >
                          <svg
                            role="img"
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <title>Google</title>
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                          </svg>
                          Entrar com Google
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "register" && (
          <div className="animate-in fade-in zoom-in-95 duration-300 ease-out">
            <Card className="rounded-2xl border-0 bg-[#121212] p-8 text-[#E0E0E0] shadow-none">
              <CardHeader className="mb-8 space-y-2 p-0">
                <CardTitle className="text-2xl font-bold tracking-wide">
                  Criar uma conta
                </CardTitle>
                <CardDescription className="text-base text-[#888888]">
                  Comece a gerenciar sua grade curricular hoje mesmo.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <Alert className="mb-6 border-[#FF3B30]/20 bg-[#FF3B30]/10 text-[#FF3B30]">
                    <IoAlertCircleOutline className="h-4 w-4 stroke-[#FF3B30]" />
                    <AlertTitle>Não foi possível cadastrar</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-[#888888]"
                    >
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Folli"
                      required
                      className="h-12 rounded-lg border border-[#1A1A1A] bg-[#000000] px-4 text-[#E0E0E0] transition-all focus-visible:border-[#007AFF] focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-email"
                      className="text-sm font-medium text-[#888888]"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="h-12 rounded-lg border border-[#1A1A1A] bg-[#000000] px-4 text-[#E0E0E0] transition-all focus-visible:border-[#007AFF] focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-password"
                      className="text-sm font-medium text-[#888888]"
                    >
                      Senha
                    </Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      required
                      className="h-12 rounded-lg border border-[#1A1A1A] bg-[#000000] px-4 text-[#E0E0E0] transition-all focus-visible:border-[#007AFF] focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-8 h-12 w-full rounded-lg bg-[#E0E0E0] text-base font-bold text-[#000000] transition-colors hover:bg-[#CCCCCC]"
                  >
                    {isLoading ? "Criando conta..." : "Cadastrar e acessar"}
                  </Button>
                </form>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#1A1A1A]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#121212] px-2 text-[#888888]">
                        Ou continue com
                      </span>
                    </div>
                  </div>

                  <form action={loginWithGoogleAction} className="mt-6">
                    <Button
                      type="submit"
                      variant="outline"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#1A1A1A] bg-transparent font-medium text-[#E0E0E0] transition-colors hover:bg-[#1A1A1A] hover:text-white"
                    >
                      <svg
                        role="img"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Google</title>
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                      </svg>
                      Cadastrar com Google
                    </Button>
                  </form>
                </div>
              </CardContent>
              <CardFooter className="mt-6 flex justify-center border-t border-[#1A1A1A] p-0 pt-6">
                <p className="text-center text-sm leading-relaxed text-[#555555]">
                  Ao se cadastrar, você concorda com nossos Termos de Serviço e
                  Política de Privacidade.
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
