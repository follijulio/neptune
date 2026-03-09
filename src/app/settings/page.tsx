"use client";

import { Input } from "@/src/components/shadcn-ui/input";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/shadcn-ui/avatar";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/components/shadcn-ui/alert";
import { useState, FormEvent } from "react";
import { updateAccountAction } from "@/src/app/actions/settings-actions";
import { CheckCircle } from "lucide-react";
import { AlertCircle } from "lucide-react";

export default function SettingsClient({
  user,
  isOAuth,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  isOAuth: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
    };

    const result = await updateAccountAction(data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto py-12 px-6 bg-black min-h-screen w-screen flex justify-center text-white">
      <div className="max-w-2xl w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Configurações de Perfil
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">
            Gerencie sua identidade visual e credenciais do Netuno.
          </p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-zinc-300">
              Foto de perfil
            </label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-zinc-800">
                <AvatarImage src={user?.image || ""} alt={user?.name} />
                <AvatarFallback className="bg-[#007AFF] text-white font-bold text-2xl">
                  {user?.name?.substring(0, 1) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-3">
                <Button
                  type="button"
                  className="bg-[#007AFF] hover:bg-[#005bb5] text-white px-4 py-2 rounded-lg font-medium text-sm h-10"
                >
                  Alterar foto
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg font-medium text-sm h-10"
                >
                  Remover foto
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-300">
              Nome
            </label>
            <Input
              name="name"
              defaultValue={user?.name}
              placeholder={user?.name || "Seu nome"}
              className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-300">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                @
              </span>
              <Input
                name="username"
                defaultValue={user?.username}
                placeholder={user?.username || "folli"}
                className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl pl-10 focus-visible:ring-[#007AFF]"
              />
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Disponível para alteração hoje.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-300">
              E-mail
            </label>
            <Input
              name="email"
              defaultValue={user?.email}
              type="email"
              placeholder={user?.email || "Seu e-mail"}
              className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
            />
          </div>

          {!isOAuth && (
            <>
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-zinc-300">
                    Senha atual
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Fluxo de 2FA em breve!")}
                    className="text-sm text-[#007AFF] hover:underline font-medium focus:outline-none"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <Input
                  name="currentPassword"
                  type="password"
                  placeholder="Sua senha atual"
                  className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-300">
                  Nova senha
                </label>
                <Input
                  name="newPassword"
                  type="password"
                  placeholder="Sua nova senha"
                  className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
                />
              </div>
            </>
          )}

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={`animate-in fade-in slide-in-from-bottom-2 ${
                message.type === "success"
                  ? "bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]"
                  : "bg-red-900/10 border-red-900/50"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" color="#00FF88" />
              )}
              <AlertTitle className="font-bold">
                {message.type === "error" ? "Erro ao salvar" : "Sucesso!"}
              </AlertTitle>
              <AlertDescription
                className={message.type === "success" ? "text-white" : ""}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#007AFF] hover:bg-[#005bb5] px-8 py-6 text-base font-bold rounded-xl text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
