"use client";

import { useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuGraduationCap,
  LuTarget,
} from "react-icons/lu";
import { UploadCloud } from "lucide-react";

import { Button } from "../../shadcn-ui/button";
import PdfUploader from "../pdf-uploader";

import { skipOnboardingAction } from "@/src/app/actions/dashboard-actions";

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

  const firstName = userName.split(" ")[0];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center">
      <div className="relative mb-12 flex w-full items-center justify-between">
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-[#1A1A1A]">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>

        {[
          { num: 1, icon: LuGraduationCap, label: "Início" },
          { num: 2, icon: LuTarget, label: "Metas" },
          { num: 3, icon: UploadCloud, label: "Importação" },
        ].map((item) => (
          <div key={item.num} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300 ${step >= item.num ? "bg-[#007AFF] text-white" : "bg-[#1A1A1A] text-[#555555]"}`}
            >
              <item.icon className="text-xl" />
            </div>
            <span
              className={`text-xs font-medium ${step >= item.num ? "text-[#E0E0E0]" : "text-[#555555]"}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex min-h-[400px] w-full flex-col overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-8 shadow-2xl">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 flex flex-1 flex-col justify-center text-center duration-500">
            <h1 className="mb-4 text-4xl font-bold text-[#E0E0E0]">
              Bem-vindo ao Netuno, {firstName}! 🌊
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-[#888888]">
              Estamos preparando o seu novo ambiente acadêmico. O Netuno vai te
              ajudar a prever coeficientes de rendimento, organizar disciplinas
              e monitorar sua evolução até o diploma.
            </p>
            <div className="mt-auto">
              <Button
                onClick={nextStep}
                className="w-full rounded-xl bg-[#007AFF] px-8 py-6 text-lg text-white hover:bg-[#005bb5] sm:w-auto"
              >
                Começar Configuração <LuArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 flex flex-1 flex-col justify-center duration-500">
            <h2 className="mb-2 text-center text-3xl font-bold text-[#E0E0E0]">
              O seu alvo principal
            </h2>
            <p className="mb-8 text-center text-[#888888]">
              Para calcularmos o seu progresso geral, precisamos saber a carga
              horária total da sua grade curricular.
            </p>

            <div className="mx-auto w-full max-w-md space-y-4">
              <label className="mb-2 block font-medium text-[#E0E0E0]">
                Carga Horária Total (Horas)
              </label>
              <input
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value))}
                className="w-full rounded-xl border border-[#333333] bg-[#121212] px-4 py-4 text-xl text-white transition-all focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] focus:outline-none"
              />
              <p className="mt-2 text-xs text-[#555555]">
                *Você pode alterar isso depois nas configurações do dashboard.
              </p>
            </div>

            <div className="mt-auto flex justify-between pt-8">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="text-[#888888] hover:text-white"
              >
                <LuArrowLeft className="mr-2" /> Voltar
              </Button>
              <Button
                onClick={nextStep}
                className="rounded-xl bg-[#007AFF] px-8 py-6 text-white hover:bg-[#005bb5]"
              >
                Avançar <LuArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 flex flex-1 flex-col duration-500">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-[#E0E0E0]">
                Sincronizar Histórico
              </h2>
              <p className="text-[#888888]">
                Envie seu boletim/histórico em PDF. Nossa inteligência
                artificial vai extrair e catalogar todas as suas disciplinas
                automaticamente.
              </p>
            </div>

            <div className="flex w-full flex-1 items-center justify-center">
              <PdfUploader />
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#1A1A1A] pt-4">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="text-[#888888] hover:text-white"
              >
                <LuArrowLeft className="mr-2" /> Voltar
              </Button>
              <button
                onClick={handleSkip}
                disabled={isSkipping}
                className="text-sm text-[#555555] transition-colors hover:text-[#888888] hover:underline disabled:opacity-50"
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
