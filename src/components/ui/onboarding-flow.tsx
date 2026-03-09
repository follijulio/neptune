"use client";

import { useState } from "react";
import {
  LuGraduationCap,
  LuTarget,
  LuArrowRight,
  LuArrowLeft,
} from "react-icons/lu";
import PdfUploader from "./pdf-uploader";
import Link from "next/link";
import { Button } from "../shadcn-ui/button";
import { UploadCloud } from "lucide-react";
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
    <div className="max-w-3xl w-full flex flex-col items-center">
      {/* Barra de Progresso */}
      <div className="w-full mb-12 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1A1A1A] -z-10 rounded-full">
          <div
            className="h-full bg-[#007AFF] transition-all duration-500 ease-out rounded-full"
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
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= item.num ? "bg-[#007AFF] text-white" : "bg-[#1A1A1A] text-[#555555]"}`}
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

      {/* Container das Etapas */}
      <div className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col">
        {/* PASSO 1: Boas-vindas */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col justify-center text-center">
            <h1 className="text-4xl font-bold text-[#E0E0E0] mb-4">
              Bem-vindo ao Netuno, {firstName}! 🌊
            </h1>
            <p className="text-[#888888] text-lg mb-8 max-w-xl mx-auto">
              Estamos preparando o seu novo ambiente acadêmico. O Netuno vai te
              ajudar a prever coeficientes de rendimento, organizar disciplinas
              e monitorar sua evolução até o diploma.
            </p>
            <div className="mt-auto">
              <Button
                onClick={nextStep}
                className="bg-[#007AFF] hover:bg-[#005bb5] text-white px-8 py-6 text-lg rounded-xl w-full sm:w-auto"
              >
                Começar Configuração <LuArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 2: Definição de Metas */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-[#E0E0E0] mb-2 text-center">
              O seu alvo principal
            </h2>
            <p className="text-[#888888] text-center mb-8">
              Para calcularmos o seu progresso geral, precisamos saber a carga
              horária total da sua grade curricular.
            </p>

            <div className="max-w-md mx-auto w-full space-y-4">
              <label className="block text-[#E0E0E0] font-medium mb-2">
                Carga Horária Total (Horas)
              </label>
              <input
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value))}
                className="w-full bg-[#121212] border border-[#333333] text-white text-xl rounded-xl px-4 py-4 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
              />
              <p className="text-xs text-[#555555] mt-2">
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
                className="bg-[#007AFF] hover:bg-[#005bb5] text-white px-8 py-6 rounded-xl"
              >
                Avançar <LuArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 3: Upload do PDF */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#E0E0E0] mb-2">
                Sincronizar Histórico
              </h2>
              <p className="text-[#888888]">
                Envie seu boletim/histórico em PDF. Nossa inteligência
                artificial vai extrair e catalogar todas as suas disciplinas
                automaticamente.
              </p>
            </div>

            <div className="flex-1 w-full flex items-center justify-center">
              <PdfUploader />
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-[#1A1A1A] pt-4">
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
                className="text-sm text-[#555555] hover:text-[#888888] transition-colors hover:underline disabled:opacity-50"
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
