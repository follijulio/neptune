"use client";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/src/components/shadcn-ui/alert";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/components/shadcn-ui/card";
import { Input } from "@/src/components/shadcn-ui/input";
import { useState } from "react";
import { LuHexagon } from "react-icons/lu";
import {
  loginAction,
  loginWithGoogleAction,
  registerAction,
} from "../actions/auth-action";
import { IoAlertCircleOutline } from "react-icons/io5";
import { Label } from "@/src/components/shadcn-ui/label";

type AuthView = "login" | "register";

export default function AuthPage() {
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
    <div className="min-h-screen w-full bg-[#000000] flex flex-col lg:flex-row items-center justify-center p-6 lg:p-24 gap-12 lg:gap-32">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[400px]">
        <LuHexagon className="text-[#007AFF] text-7xl lg:text-8xl mb-6" />
        <h1 className="text-[#E0E0E0] text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Netuno
        </h1>
        <p className="text-[#888888] text-lg lg:text-xl leading-relaxed mb-12 ">
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
        <div className="grid w-full grid-cols-2 bg-[#121212] p-1.5 rounded-xl h-14">
          <button
            onClick={() => switchView("login")}
            className={`transition-all duration-300 text-sm font-medium h-full rounded-lg flex items-center justify-center ${
              currentView === "login"
                ? "bg-[#1A1A1A] text-[#E0E0E0]"
                : "bg-transparent text-[#888888] hover:text-[#E0E0E0]"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => switchView("register")}
            className={`transition-all duration-300 text-sm font-medium h-full rounded-lg flex items-center justify-center ${
              currentView === "register"
                ? "bg-[#1A1A1A] text-[#E0E0E0]"
                : "bg-transparent text-[#888888] hover:text-[#E0E0E0]"
            }`}
          >
            Cadastrar
          </button>
        </div>
      </div>

      <div className="w-full max-w-[450px]">
        {currentView === "login" && (
          <div className="animate-in fade-in zoom-in-95 duration-300 ease-out">
            <Card className="bg-[#121212] border-0 text-[#E0E0E0] p-8 shadow-none rounded-2xl">
              <CardHeader className="p-0 mb-8 space-y-2">
                <CardTitle className="text-2xl font-bold tracking-wide">
                  {showTwoFactor
                    ? "Verificação de Segurança"
                    : "Bem-vindo de volta"}
                </CardTitle>
                <CardDescription className="text-[#888888] text-base">
                  {showTwoFactor
                    ? "Enviamos um código de 6 dígitos para o seu e-mail."
                    : "Insira suas credenciais para acessar seu painel."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <Alert className="mb-6 bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20">
                    <IoAlertCircleOutline className="h-4 w-4 stroke-[#FF3B30]" />
                    <AlertTitle>Erro na autenticação</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* TODO: transfomar em componente depois */}
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
                        className="h-14 px-4 bg-[#000000] border border-[#1A1A1A] text-[#E0E0E0] focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] transition-all rounded-lg tracking-[1em] text-center text-2xl font-bold"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-base bg-[#007AFF] text-white hover:bg-[#007AFF]/80 transition-colors font-bold mt-8 rounded-lg"
                    >
                      {isLoading ? "Verificando..." : "Confirmar Código"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowTwoFactor(false)}
                      className="w-full mt-4 text-sm text-[#888888] hover:text-[#E0E0E0] transition-colors"
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
                          className="text-[#888888] text-sm font-medium"
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
                          className="h-12 px-4 bg-[#000000] border border-[#1A1A1A] text-[#E0E0E0] focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] transition-all rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="password"
                            className="text-[#888888] text-sm font-medium"
                          >
                            Senha
                          </Label>
                          <a
                            href="#"
                            className="text-sm text-[#007AFF] hover:underline transition-colors"
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
                          className="h-12 px-4 bg-[#000000] border border-[#1A1A1A] text-[#E0E0E0] focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] transition-all rounded-lg"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-base bg-[#E0E0E0] text-[#000000] hover:bg-[#CCCCCC] transition-colors font-bold mt-8 rounded-lg"
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
                          className="w-full h-12 bg-transparent border border-[#1A1A1A] text-[#E0E0E0] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium flex items-center justify-center gap-2 rounded-lg"
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
            <Card className="bg-[#121212] border-0 text-[#E0E0E0] p-8 shadow-none rounded-2xl">
              <CardHeader className="p-0 mb-8 space-y-2">
                <CardTitle className="text-2xl font-bold tracking-wide">
                  Criar uma conta
                </CardTitle>
                <CardDescription className="text-[#888888] text-base">
                  Comece a gerenciar sua grade curricular hoje mesmo.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <Alert className="mb-6 bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20">
                    <IoAlertCircleOutline className="h-4 w-4 stroke-[#FF3B30]" />
                    <AlertTitle>Não foi possível cadastrar</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[#888888] text-sm font-medium"
                    >
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Folli"
                      required
                      className="h-12 px-4 bg-[#000000] border border-[#1A1A1A] text-[#E0E0E0] focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] transition-all rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-email"
                      className="text-[#888888] text-sm font-medium"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="h-12 px-4 bg-[#000000] border border-[#1A1A1A] text-[#E0E0E0] focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] transition-all rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-password"
                      className="text-[#888888] text-sm font-medium"
                    >
                      Senha
                    </Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      required
                      className="h-12 px-4 bg-[#000000] border border-[#1A1A1A] text-[#E0E0E0] focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] transition-all rounded-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base bg-[#E0E0E0] text-[#000000] hover:bg-[#CCCCCC] transition-colors font-bold mt-8 rounded-lg"
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
                      className="w-full h-12 bg-transparent border border-[#1A1A1A] text-[#E0E0E0] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium flex items-center justify-center gap-2 rounded-lg"
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
              <CardFooter className="flex justify-center border-t border-[#1A1A1A] pt-6 mt-6 p-0">
                <p className="text-sm text-[#555555] text-center leading-relaxed">
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
