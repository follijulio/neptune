"use client";

import { useEffect, useMemo, useState } from "react";
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
    shadow: "shadow-[#007AFF]/20",
  },
  shortBreak: {
    time: 5 * 60,
    label: "Pausa Curta",
    icon: LuCoffee,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/50",
    shadow: "shadow-emerald-500/20",
  },
  longBreak: {
    time: 15 * 60,
    label: "Descanso Longo",
    icon: LuBed,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/50",
    shadow: "shadow-amber-500/20",
  },
};

export default function PomodoroClient() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            const audio = new Audio(
              "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
            );
            audio.play().catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
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

  const formattedTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const currentMode = MODES[mode];
  const ModeIcon = currentMode.icon;

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center px-4 py-8 text-white sm:h-full">
      <div
        className={`relative flex w-full max-w-md flex-col items-center rounded-3xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 transition-all duration-500 sm:rounded-[2rem] sm:p-12 ${
          isActive ? `${currentMode.shadow} border-[#1A1A1A]` : "shadow-2xl"
        }`}
      >
        <div className="custom-scrollbar mb-8 flex w-full justify-between overflow-x-auto rounded-xl bg-zinc-900/50 p-1 sm:mb-12 sm:rounded-2xl sm:p-1.5">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`min-w-max flex-1 rounded-lg px-2 py-2 text-[10px] font-bold whitespace-nowrap transition-all duration-300 sm:rounded-xl sm:px-0 sm:text-sm ${
                mode === m
                  ? `bg-[#1A1A1A] ${MODES[m].color} shadow-sm`
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative mb-8 flex flex-col items-center justify-center sm:mb-12">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 sm:gap-3 sm:px-4 sm:py-2 ${currentMode.bg} ${currentMode.color} ${currentMode.border} mb-4 transition-colors duration-500 sm:mb-6`}
          >
            <ModeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-bold tracking-wide uppercase sm:text-sm">
              {currentMode.label}
            </span>
          </div>

          <h1 className="bg-linear-to-b from-white to-zinc-500 bg-clip-text text-[80px] leading-none font-black tracking-tighter text-transparent tabular-nums select-none sm:text-[100px] md:text-[120px]">
            {formattedTime}
          </h1>
        </div>
        <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:gap-4">
          <Button
            onClick={toggleTimer}
            className={`h-14 flex-1 rounded-xl px-6 text-base font-black transition-all duration-300 hover:scale-105 sm:h-16 sm:flex-none sm:rounded-2xl sm:px-8 sm:text-lg ${
              isActive
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : `bg-[#007AFF] text-white shadow-[0_0_30px_rgba(0,122,255,0.3)] hover:bg-[#005bb5]`
            }`}
          >
            {isActive ? (
              <>
                <LuPause className="mr-1.5 h-5 w-5 shrink-0 sm:mr-2 sm:h-6 sm:w-6" />
                <span className="truncate">Pausar</span>
              </>
            ) : (
              <>
                <LuPlay className="mr-1.5 h-5 w-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6" />
                <span className="truncate">Começar</span>
              </>
            )}
          </Button>

          <Button
            onClick={resetTimer}
            variant="ghost"
            className="h-14 w-14 shrink-0 rounded-xl bg-zinc-900 p-0 text-zinc-400 transition-all hover:-rotate-45 hover:bg-zinc-800 hover:text-white sm:h-16 sm:w-16 sm:rounded-2xl"
            title="Reiniciar Timer"
          >
            <LuRotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
