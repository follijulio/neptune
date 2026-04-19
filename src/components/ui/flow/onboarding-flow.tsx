"use client";

import { useMemo, useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuGraduationCap,
  LuHexagon,
  LuTarget,
} from "react-icons/lu";
import { UploadCloud } from "lucide-react";

import { Button } from "../../shadcn-ui/button";
import PdfUploader from "../pdf-uploader";

import { skipOnboardingAction } from "@/src/app/actions/dashboard-actions";
import { Input } from "@/src/components/shadcn-ui/input";

export default function OnboardingFlow({ userName }: { userName: string }) {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = async () => {
    setIsSkipping(true);
    await skipOnboardingAction(totalHours);
  };
  const [step, setStep] = useState(1);
  const [totalHours, setTotalHours] = useState(3200);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const firstName = useMemo(() => userName.split(" ")[0], [userName]);

  const STEPS_DATA = useMemo(
    () => [
      { num: 1, icon: LuGraduationCap, label: "Início" },
      { num: 2, icon: LuTarget, label: "Metas" },
      { num: 3, icon: UploadCloud, label: "Importação" },
    ],
    [],
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 sm:px-6">
      <div className="relative mb-8 flex w-full items-center justify-between sm:mb-12">
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-[#1A1A1A]">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>

        {STEPS_DATA.map((item) => (
          <div
            key={item.num}
            className="flex flex-col items-center gap-1.5 sm:gap-2"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 sm:h-12 sm:w-12 ${step >= item.num ? "bg-[#007AFF] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]" : "bg-[#1A1A1A] text-[#555555]"}`}
            >
              <item.icon className="text-lg sm:text-xl" />
            </div>
            <span
              className={`text-[10px] font-medium sm:text-xs ${step >= item.num ? "text-[#E0E0E0]" : "text-[#555555]"}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex min-h-100 w-full flex-col overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 shadow-2xl sm:min-h-[500px] sm:p-8">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 flex flex-1 flex-col justify-center text-center duration-500">
            <h1 className="mb-3 flex flex-col items-center justify-center gap-2 text-2xl font-bold text-[#E0E0E0] sm:mb-4 sm:flex-row sm:text-4xl">
              <span className="flex items-center gap-2">
                Bem-vindo ao Netuno,
                <LuHexagon className="inline text-2xl text-[#007AFF] sm:text-3xl" />
              </span>
              <span className="text-[#007AFF]">{firstName}!</span>
            </h1>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-[#888888] sm:mb-8 sm:text-lg">
              Estamos preparando o seu novo ambiente acadêmico. O Netuno vai te
              ajudar a prever coeficientes de rendimento, organizar disciplinas
              e monitorar sua evolução até o diploma.
            </p>
            <div className="mt-auto">
              <Button
                onClick={nextStep}
                className="w-full rounded-xl bg-[#007AFF] px-6 py-5 text-base font-bold text-white transition-transform hover:scale-105 hover:bg-[#005bb5] sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
              >
                Começar Configuração <LuArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 flex flex-1 flex-col justify-center duration-500">
            <div className="mb-8 sm:mb-12">
              <h2 className="mb-2 text-center text-2xl font-bold text-[#E0E0E0] sm:text-3xl">
                O seu alvo principal
              </h2>
              <p className="mx-auto max-w-md text-center text-sm text-[#888888] sm:text-base">
                Para calcularmos o seu progresso geral, precisamos saber a carga
                horária total da sua grade curricular.
              </p>
            </div>

            <div className="mx-auto w-full max-w-md space-y-3 sm:space-y-4">
              <label className="block text-center text-sm font-semibold text-[#E0E0E0] sm:text-left sm:text-base">
                Carga Horária Total (Horas)
              </label>
              <input
                title="Input"
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value))}
                className="w-full rounded-xl border border-[#333333] bg-[#121212] px-4 py-4 text-center text-xl font-bold text-[#007AFF] transition-all focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 focus:outline-none sm:py-5 sm:text-left sm:text-2xl"
              />
              <p className="text-center text-[10px] text-[#555555] sm:text-left sm:text-xs">
                *Você pode alterar isso depois nas configurações do dashboard.
              </p>
            </div>

            <div className="mt-auto flex flex-col-reverse justify-between gap-4 pt-8 sm:flex-row">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="h-12 w-full text-[#888888] hover:text-white sm:w-auto"
              >
                <LuArrowLeft className="mr-2" /> Voltar
              </Button>
              <Button
                onClick={nextStep}
                className="w-full rounded-xl bg-[#007AFF] px-8 py-6 text-base font-bold text-white hover:bg-[#005bb5] sm:w-auto"
              >
                Avançar <LuArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 flex flex-1 flex-col duration-500">
            <div className="mb-4 text-center sm:mb-6">
              <h2 className="mb-1.5 text-xl font-bold text-[#E0E0E0] sm:mb-2 sm:text-2xl">
                Sincronizar Histórico
              </h2>
              <p className="mx-auto max-w-lg text-xs text-[#888888] sm:text-sm">
                Envie seu boletim/histórico em PDF. Nossa inteligência
                artificial vai extrair e catalogar todas as suas disciplinas
                automaticamente.
              </p>
            </div>

            <div className="flex w-full flex-1 items-center justify-center">
              <PdfUploader />
            </div>

            <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 border-t border-[#1A1A1A] pt-4 sm:flex-row sm:pt-6">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="h-10 w-full text-[#888888] hover:text-white sm:h-12 sm:w-auto"
              >
                <LuArrowLeft className="mr-2" /> Voltar
              </Button>
              <button
                onClick={handleSkip}
                disabled={isSkipping}
                className="text-xs font-medium text-[#555555] transition-colors hover:text-[#888888] hover:underline disabled:opacity-50 sm:text-sm"
              >
                {isSkipping ? "Preparando painel..." : "Pular sincronização"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
