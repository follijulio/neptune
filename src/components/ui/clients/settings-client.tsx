"use client";

import { type FormEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

import {
  resetPasswordWith2FAAction,
  sendSettings2FACodeAction,
} from "@/src/app/actions/settings-2fa-actions";
import { updateAccountAction } from "@/src/app/actions/settings-actions";
import { updateUserImageAction } from "@/src/app/actions/user-actions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/components/shadcn-ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/shadcn-ui/avatar";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/shadcn-ui/dialog";
import { Input } from "@/src/components/shadcn-ui/input";
import { UploadButton } from "@/src/components/ui/upload-button";

interface SettingsUser {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SettingsClientProps {
  user: SettingsUser | null;
  isOAuth: boolean;
}

export default function SettingsClient({ user, isOAuth }: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    error?: object;
  } | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"VERIFY_CODE" | "NEW_PASSWORD">(
    "VERIFY_CODE",
  );
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [twoFaCode, setTwoFaCode] = useState("");
  const [newPasswordModal, setNewPasswordModal] = useState("");

  const fallbackLetter = useMemo(
    () => user?.name?.substring(0, 1).toUpperCase() || "U",
    [user?.name],
  );

  const alertDetails = useMemo<{
    variant: "default" | "destructive";
    className: string;
    title: string;
    Icon: typeof CheckCircle;
    iconColor?: string;
    descClassName: string;
  } | null>(() => {
    if (!message) return null;
    const isSuccess = message.type === "success";
    return {
      variant: isSuccess ? "default" : "destructive",
      className: isSuccess
        ? "border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88]"
        : "border-red-900/50 bg-red-900/10",
      title: isSuccess ? "Sucesso!" : "Erro ao salvar",
      Icon: isSuccess ? CheckCircle : AlertCircle,
      iconColor: isSuccess ? "#00FF88" : undefined,
      descClassName: isSuccess ? "text-white" : "",
    };
  }, [message]);

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    const rawUsername = (formData.get("username") as string) ?? "";
    const username = rawUsername.trim().replace(/^@+/, "");

    const data = {
      name: ((formData.get("name") as string) ?? "").trim(),
      username,
      email: ((formData.get("email") as string) ?? "").trim(),
      currentPassword: (formData.get("currentPassword") as string) ?? "",
      newPassword: (formData.get("newPassword") as string) ?? "",
    };

    const result = await updateAccountAction(data);

    if (result?.error) setMessage({ type: "error", text: result.error });
    else if (result?.success)
      setMessage({ type: "success", text: result.success });

    setLoading(false);
  }

  async function handleRemovePhoto() {
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateUserImageAction("");

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Foto removida com sucesso!" });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ocorreu um erro interno ao remover a foto.",
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { error },
      });
    } finally {
      setLoading(false);
    }
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
    <section className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">
      <main className="flex w-full justify-center">
        <div className="w-full max-w-3xl">
          <form onSubmit={handleUpdate} className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <label className="block text-xs font-semibold text-zinc-300 sm:text-sm">
                Foto de perfil
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Avatar className="h-16 w-16 border border-zinc-800 sm:h-20 sm:w-20">
                  <AvatarImage src={user?.image || ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="bg-[#007AFF] text-xl font-bold text-white sm:text-2xl">
                    {fallbackLetter}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <UploadButton
                    endpoint="profilePicture"
                    onUploadBegin={() => {
                      setLoading(true);
                      setMessage(null);
                    }}
                    onClientUploadComplete={async (res) => {
                      if (res && res[0]) {
                        try {
                          const result = await updateUserImageAction(
                            res[0].ufsUrl,
                          );

                          if (result?.error) {
                            setMessage({ type: "error", text: result.error });
                          } else {
                            setMessage({
                              type: "success",
                              text: "Foto atualizada com sucesso!",
                            });
                            setTimeout(() => {
                              window.location.reload();
                            }, 1000);
                          }
                        } catch (error) {
                          setMessage({
                            type: "error",
                            text: "Erro ao comunicar com o servidor.",
                            error: { error },
                          });
                        }
                      }
                      setLoading(false);
                    }}
                    onUploadError={(error: Error) => {
                      setMessage({
                        type: "error",
                        text: `Erro no envio: ${error.message}`,
                      });
                      setLoading(false);
                    }}
                    appearance={{
                      button:
                        "h-9 sm:h-10 rounded-lg bg-[#007AFF] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#005bb5] focus-within:ring-[#007AFF] ut-uploading:opacity-50 ut-uploading:cursor-not-allowed m-0 w-full sm:w-auto",
                      allowedContent: "hidden",
                      container: "w-auto flex-row m-0",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return "Enviando...";
                        if (ready) return "Alterar foto";
                        return "Carregando...";
                      },
                    }}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemovePhoto}
                    disabled={loading || !user?.image}
                    className="h-9 w-full rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 sm:h-10 sm:w-auto sm:px-4 sm:text-sm"
                  >
                    Remover foto
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs font-semibold text-zinc-300 sm:text-sm">
                Nome
              </label>
              <Input
                name="name"
                defaultValue={user?.name ?? ""}
                placeholder={user?.name || "Seu nome"}
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs font-semibold text-zinc-300 sm:text-sm">
                Username
              </label>
              <Input
                name="username"
                defaultValue={`@${user?.username || ""}`}
                placeholder={`@${user?.username || ""}`}
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs font-semibold text-zinc-300 sm:text-sm">
                E-mail
              </label>
              <Input
                name="email"
                defaultValue={user?.email ?? ""}
                type="email"
                placeholder={user?.email || "Seu e-mail"}
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
              />
            </div>

            {!isOAuth && (
              <>
                <div className="space-y-1.5 pt-2 sm:space-y-2 sm:pt-4">
                  <div className="flex flex-row items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-300 sm:text-sm">
                      Senha atual
                    </label>
                    <button
                      type="button"
                      onClick={handleStartPasswordReset}
                      className="text-xs font-medium text-[#007AFF] hover:underline focus:outline-none sm:text-sm"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    name="currentPassword"
                    type="password"
                    placeholder="Sua senha atual"
                    className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 sm:text-sm">
                    Nova senha
                  </label>
                  <Input
                    name="newPassword"
                    type="password"
                    placeholder="Sua nova senha"
                    className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
                  />
                </div>
              </>
            )}

            {alertDetails && message && (
              <Alert
                variant={alertDetails.variant || "default"}
                className={alertDetails.className}
              >
                <alertDetails.Icon
                  className="h-4 w-4"
                  color={alertDetails.iconColor}
                />
                <AlertTitle className="text-sm font-bold sm:text-base">
                  {alertDetails.title}
                </AlertTitle>
                <AlertDescription
                  className={`text-xs sm:text-sm ${alertDetails.descClassName}`}
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 sm:pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#007AFF] px-6 py-5 text-sm font-bold text-white transition-colors hover:bg-[#005bb5] disabled:opacity-50 sm:w-auto sm:px-8 sm:py-6 sm:text-base"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>

          <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
            <DialogContent className="w-[95vw] max-w-100 rounded-xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold sm:text-xl">
                  Recuperar Senha
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 sm:text-sm">
                  {resetStep === "VERIFY_CODE"
                    ? "Enviamos um código de segurança para o seu e-mail."
                    : "Digite sua nova senha abaixo."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 sm:space-y-4 sm:py-4">
                {resetError && (
                  <p className="text-xs font-medium text-red-500 sm:text-sm">
                    {resetError}
                  </p>
                )}
                {resetStep === "VERIFY_CODE" ? (
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                      Código de 6 dígitos
                    </label>
                    <Input
                      value={twoFaCode}
                      onChange={(e) => setTwoFaCode(e.target.value)}
                      maxLength={6}
                      placeholder="000000"
                      className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-center text-lg tracking-[0.3em] text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-2xl sm:tracking-[0.5em]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                      Sua nova senha
                    </label>
                    <Input
                      type="password"
                      value={newPasswordModal}
                      onChange={(e) => setNewPasswordModal(e.target.value)}
                      placeholder="Nova senha secreta"
                      className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
                    />
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-col justify-end gap-2 sm:mt-4 sm:flex-row sm:gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsResetModalOpen(false)}
                  className="order-2 h-10 w-full hover:bg-zinc-800 hover:text-white sm:order-1 sm:h-10 sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmPasswordReset}
                  disabled={resetLoading}
                  className="order-1 h-10 w-full bg-[#007AFF] font-bold text-white hover:bg-[#005bb5] sm:order-2 sm:h-10 sm:w-auto"
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
    </section>
  );
}
