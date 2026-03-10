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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/shadcn-ui/dialog";
import { useState } from "react";
import { updateAccountAction } from "@/src/app/actions/settings-actions";
import {
  sendSettings2FACodeAction,
  resetPasswordWith2FAAction,
} from "@/src/app/actions/settings-2fa-actions";
import { AlertCircle, CheckCircle } from "lucide-react";
import MainLayout from "@/src/components/ui/main-layout";

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

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"VERIFY_CODE" | "NEW_PASSWORD">(
    "VERIFY_CODE",
  );
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [twoFaCode, setTwoFaCode] = useState("");
  const [newPasswordModal, setNewPasswordModal] = useState("");

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
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

    if (result?.error) setMessage({ type: "error", text: result.error });
    else if (result?.success)
      setMessage({ type: "success", text: result.success });

    setLoading(false);
  }

  async function handleStartPasswordReset() {
    setIsResetModalOpen(true);
    setResetStep("VERIFY_CODE");
    setResetError(null);
    setTwoFaCode("");
    setNewPasswordModal("");
    setResetLoading(true);

    const result = await sendSettings2FACodeAction();
    if (result.error) setResetError(result.error);

    setResetLoading(false);
  }

  async function handleConfirmPasswordReset() {
    if (resetStep === "VERIFY_CODE") {
      if (twoFaCode.length < 6) {
        setResetError("O código deve ter 6 dígitos.");
        return;
      }
      setResetError(null);
      setResetStep("NEW_PASSWORD");
      return;
    }

    if (resetStep === "NEW_PASSWORD") {
      if (newPasswordModal.length < 6) {
        setResetError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      setResetLoading(true);
      const result = await resetPasswordWith2FAAction(
        twoFaCode,
        newPasswordModal,
      );

      if (result?.error) {
        setResetError(result.error);
      } else if (result?.success) {
        setIsResetModalOpen(false);
        setMessage({ type: "success", text: result.success });
      }
      setResetLoading(false);
    }
  }

  return (
    <MainLayout>
      <main className="flex w-full justify-center">
        <div className="w-full max-w-3xl">
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-300">
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border border-zinc-800">
                  <AvatarImage src={user?.image || ""} alt={user?.name} />
                  <AvatarFallback className="bg-[#007AFF] text-2xl font-bold text-white">
                    {user?.name?.substring(0, 1) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    className="h-10 rounded-lg bg-[#007AFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#005bb5]"
                  >
                    Alterar foto
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400"
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
                className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-300">
                Username
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-medium text-zinc-500">
                  @
                </span>
                <Input
                  name="username"
                  defaultValue={user?.username}
                  placeholder={user?.username || "folli"}
                  className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 pl-10 text-white focus-visible:ring-[#007AFF]"
                />
              </div>
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
                className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
              />
            </div>

            {!isOAuth && (
              <>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-zinc-300">
                      Senha atual
                    </label>
                    <button
                      type="button"
                      onClick={handleStartPasswordReset}
                      className="text-sm font-medium text-[#007AFF] hover:underline focus:outline-none"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    name="currentPassword"
                    type="password"
                    placeholder="Sua senha atual"
                    className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
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
                    className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
                  />
                </div>
              </>
            )}

            {message && (
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
                className={
                  message.type === "success"
                    ? "border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88]"
                    : "border-red-900/50 bg-red-900/10"
                }
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
                className="w-full rounded-xl bg-[#007AFF] px-8 py-6 text-base font-bold text-white transition-colors hover:bg-[#005bb5] disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>

          <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
            <DialogContent className="border-[#1A1A1A] bg-[#121212] text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Recuperar Senha
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {resetStep === "VERIFY_CODE"
                    ? "Enviamos um código de segurança para o seu e-mail."
                    : "Digite sua nova senha abaixo."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {resetError && (
                  <p className="text-sm font-medium text-red-500">
                    {resetError}
                  </p>
                )}

                {resetStep === "VERIFY_CODE" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">
                      Código de 6 dígitos
                    </label>
                    <Input
                      value={twoFaCode}
                      onChange={(e) => setTwoFaCode(e.target.value)}
                      maxLength={6}
                      placeholder="000000"
                      className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-center text-2xl tracking-[0.5em] text-white focus-visible:ring-[#007AFF]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">
                      Sua nova senha
                    </label>
                    <Input
                      type="password"
                      value={newPasswordModal}
                      onChange={(e) => setNewPasswordModal(e.target.value)}
                      placeholder="Nova senha secreta"
                      className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsResetModalOpen(false)}
                  className="hover:bg-zinc-800 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmPasswordReset}
                  disabled={resetLoading}
                  className="bg-[#007AFF] font-bold text-white hover:bg-[#005bb5]"
                >
                  {resetLoading
                    ? "Processando..."
                    : resetStep === "VERIFY_CODE"
                      ? "Avançar"
                      : "Salvar Senha"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </MainLayout>
  );
}
