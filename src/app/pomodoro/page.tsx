"use client";

import { useEffect, useState } from "react";
import {
  LuBed,
  LuBrain,
  LuCoffee,
  LuPause,
  LuPlay,
  LuRotateCcw,
} from "react-icons/lu";

import { Button } from "@/src/components/shadcn-ui/button";

type Mode = "focus" | "shortBreak" | "longBreak";

const MODES = {
  focus: {
    time: 25 * 60,
    label: "Foco Profundo",
    icon: LuBrain,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10",
    border: "border-[#007AFF]/50",
  },
  shortBreak: {
    time: 5 * 60,
    label: "Pausa Curta",
    icon: LuCoffee,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/50",
  },
  longBreak: {
    time: 15 * 60,
    label: "Descanso Longo",
    icon: LuBed,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/50",
  },
};

export default function Page() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            const audio = new Audio(
              "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
            );
            audio
              .play()
              .catch(() => console.error("Áudio bloqueado pelo navegador"));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].time);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentMode = MODES[mode];
  const ModeIcon = currentMode.icon;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 text-white">
      <div
        className={`relative flex w-full max-w-md flex-col items-center rounded-[2rem] border border-[#1A1A1A] bg-[#0A0A0A] p-8 shadow-2xl transition-all duration-500 sm:p-12 ${isActive ? `shadow-${currentMode.color.split("-")[1]}/10 border-[#1A1A1A]` : ""}`}
      >
        <div className="mb-12 flex w-full justify-between rounded-2xl bg-zinc-900/50 p-1.5">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all duration-300 sm:text-sm ${
                mode === m
                  ? `bg-[#1A1A1A] ${MODES[m].color} shadow-sm`
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative mb-12 flex flex-col items-center justify-center">
          <div
            className={`flex items-center gap-3 rounded-full border px-4 py-2 ${currentMode.bg} ${currentMode.color} ${currentMode.border} mb-6 transition-colors duration-500`}
          >
            <ModeIcon className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide uppercase">
              {currentMode.label}
            </span>
          </div>

          <h1 className="bg-linear-to-b from-white to-zinc-500 bg-clip-text text-[100px] leading-none font-black tracking-tighter text-transparent tabular-nums select-none sm:text-[120px]">
            {formatTime(timeLeft)}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleTimer}
            className={`h-16 rounded-2xl px-8 text-lg font-black transition-all duration-300 hover:scale-105 ${
              isActive
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : `bg-[#007AFF] text-white shadow-[0_0_30px_rgba(0,122,255,0.3)] hover:bg-[#005bb5]`
            }`}
          >
            {isActive ? (
              <>
                <LuPause className="mr-2 h-6 w-6" /> Pausar
              </>
            ) : (
              <>
                <LuPlay className="mr-2 h-6 w-6 fill-current" /> Começar
              </>
            )}
          </Button>

          <Button
            onClick={resetTimer}
            variant="ghost"
            className="h-16 w-16 rounded-2xl bg-zinc-900 p-0 text-zinc-400 transition-all hover:-rotate-45 hover:bg-zinc-800 hover:text-white"
            title="Reiniciar Timer"
          >
            <LuRotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
