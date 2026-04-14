"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuBed,
  LuBrain,
  LuCoffee,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuTimer,
  LuTrophy,
} from "react-icons/lu";
import { toast } from "sonner";

import {
  getMonthlyStudyTimeAction,
  saveStudySessionAction,
} from "@/src/app/actions/gamification-actions";
import { Button } from "@/src/components/shadcn-ui/button";

type AppMode = "pomodoro" | "timer";
type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

const POMODORO_CONFIG = {
  focus: {
    time: 25 * 60,
    label: "Foco Profundo",
    icon: LuBrain,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10",
    pill: "bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/30",
    glow: "shadow-[0_0_60px_rgba(0,122,255,0.12)]",
    activeDot: "bg-[#007AFF]",
  },
  shortBreak: {
    time: 5 * 60,
    label: "Pausa Curta",
    icon: LuCoffee,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    glow: "shadow-[0_0_60px_rgba(52,211,153,0.10)]",
    activeDot: "bg-emerald-400",
  },
  longBreak: {
    time: 15 * 60,
    label: "Descanso Longo",
    icon: LuBed,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    pill: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.10)]",
    activeDot: "bg-amber-400",
  },
};

export default function PomodoroClient() {
  const [appMode, setAppMode] = useState<AppMode>("pomodoro");
  const [phase, setPhase] = useState<PomodoroPhase>("focus");

  const [timeLeft, setTimeLeft] = useState(POMODORO_CONFIG.focus.time);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [isActive, setIsActive] = useState(false);
  const [monthlyMinutes, setMonthlyMinutes] = useState(0);

  useEffect(() => {
    getMonthlyStudyTimeAction().then(setMonthlyMinutes);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive) {
      interval = setInterval(() => {
        if (appMode === "timer") {
          setElapsedTime((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (phase === "focus") {
                handleFinishSession(
                  Math.floor(POMODORO_CONFIG.focus.time / 60),
                );
              } else {
                setIsActive(false);
                toast.info("Pausa finalizada! Hora de voltar ao trabalho.");
                playAlarm();
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, appMode, phase]);

  const playAlarm = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    );
    audio.play().catch(() => {});
  };

  async function handleFinishSession(minutes: number) {
    setIsActive(false);
    playAlarm();
    const sessionMode = appMode === "timer" ? "timer" : "focus";
    const res = await saveStudySessionAction(minutes, sessionMode);
    if (res.success) {
      toast.success(`Sessão computada! +${res.xpGained} XP extraído.`);
      const newTotal = await getMonthlyStudyTimeAction();
      setMonthlyMinutes(newTotal);
      resetTimer();
    }
  }

  const resetTimer = () => {
    setIsActive(false);
    if (appMode === "pomodoro") {
      setTimeLeft(POMODORO_CONFIG[phase].time);
    } else {
      setElapsedTime(0);
    }
  };

  const switchAppMode = (mode: AppMode) => {
    setAppMode(mode);
    setIsActive(false);
    if (mode === "pomodoro") {
      setTimeLeft(POMODORO_CONFIG[phase].time);
    } else {
      setElapsedTime(0);
    }
  };

  const switchPhase = (newPhase: PomodoroPhase) => {
    setPhase(newPhase);
    setIsActive(false);
    setTimeLeft(POMODORO_CONFIG[newPhase].time);
  };

  const formattedDisplay = useMemo(() => {
    const s = appMode === "timer" ? elapsedTime : timeLeft;
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }, [timeLeft, elapsedTime, appMode]);

  const currentConfig =
    appMode === "pomodoro"
      ? POMODORO_CONFIG[phase]
      : {
          label: "Timer Livre",
          icon: LuTimer,
          color: "text-[#007AFF]",
          bg: "bg-[#007AFF]/10",
          pill: "",
          glow: "shadow-[0_0_60px_rgba(0,122,255,0.10)]",
          activeDot: "bg-[#007AFF]",
        };

  const Icon = currentConfig.icon;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#050505] px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(0,122,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="absolute top-6 right-6 z-10 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF]/10">
          <LuTrophy className="h-4 w-4 text-[#007AFF]" />
        </div>
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-zinc-600 uppercase">
            Esforço Mensal
          </p>
          <p className="text-base font-black text-white tabular-nums">
            {Math.floor(monthlyMinutes / 60)}
            <span className="text-zinc-500">h</span> {monthlyMinutes % 60}
            <span className="text-zinc-500">m</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-8 flex rounded-2xl border border-white/5 bg-white/[0.03] p-1 backdrop-blur-sm">
        {(["pomodoro", "timer"] as AppMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => switchAppMode(mode)}
            className={`relative flex items-center gap-2 rounded-xl px-7 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${
              appMode === mode
                ? "text-white"
                : "text-zinc-600 hover:text-zinc-400"
            } `}
          >
            {appMode === mode && (
              <span className="absolute inset-0 rounded-xl bg-white/[0.07]" />
            )}
            <span className="relative flex items-center gap-2">
              {mode === "pomodoro" ? (
                <LuBrain className="h-3.5 w-3.5" />
              ) : (
                <LuTimer className="h-3.5 w-3.5" />
              )}
              {mode === "pomodoro" ? "Pomodoro" : "Cronômetro Livre"}
            </span>
          </button>
        ))}
      </div>

      <div
        className={`relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-white/[0.06] bg-[#0A0A0A] px-8 py-10 transition-shadow duration-700 ${isActive ? currentConfig.glow : "shadow-none"} `}
      >
        <div className="absolute top-0 right-8 left-8 h-px rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div
          className={`mb-8 w-full overflow-hidden transition-all duration-500 ease-in-out ${
            appMode === "pomodoro"
              ? "max-h-20 opacity-100"
              : "max-h-0 opacity-0"
          } `}
        >
          <div className="flex items-center justify-center gap-2">
            {(Object.keys(POMODORO_CONFIG) as PomodoroPhase[]).map((p) => {
              const cfg = POMODORO_CONFIG[p];
              const PhaseIcon = cfg.icon;
              const isSelected = phase === p && appMode === "pomodoro";
              return (
                <button
                  key={p}
                  onClick={() => switchPhase(p)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                    isSelected
                      ? cfg.pill
                      : "border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400"
                  } `}
                >
                  <PhaseIcon className="h-3 w-3" />
                  {p === "focus"
                    ? "Foco"
                    : p === "shortBreak"
                      ? "Pausa"
                      : "Descanso"}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 ${currentConfig.bg}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${currentConfig.activeDot} ${isActive ? "animate-pulse" : ""}`}
          />
          <Icon className={`h-3.5 w-3.5 ${currentConfig.color}`} />
          <span
            className={`text-[10px] font-black tracking-[0.18em] uppercase ${currentConfig.color}`}
          >
            {currentConfig.label}
          </span>
        </div>

        <div className="relative mb-10 select-none">
          <h1
            className="bg-gradient-to-b from-white via-white/90 to-zinc-500 bg-clip-text leading-none font-black text-transparent tabular-nums"
            style={{ fontSize: "clamp(80px, 20vw, 108px)" }}
          >
            {formattedDisplay}
          </h1>
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#0A0A0A] opacity-60 select-none"
            aria-hidden
          />
        </div>

        <div className="flex w-full items-center gap-3">
          <Button
            onClick={() => setIsActive(!isActive)}
            className={`h-14 flex-1 rounded-2xl text-sm font-black tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              isActive
                ? "bg-white/[0.07] text-white hover:bg-white/10"
                : "bg-[#007AFF] text-white shadow-[0_0_28px_rgba(0,122,255,0.35)] hover:bg-[#0066d6] hover:shadow-[0_0_40px_rgba(0,122,255,0.45)]"
            } `}
          >
            <span className="flex items-center justify-center gap-2">
              {isActive ? (
                <>
                  <LuPause className="h-5 w-5" />
                  Pausar
                </>
              ) : (
                <>
                  <LuPlay className="h-5 w-5 fill-current" />
                  Iniciar
                </>
              )}
            </span>
          </Button>

          {appMode === "timer" && elapsedTime >= 60 && (
            <Button
              onClick={() => handleFinishSession(Math.floor(elapsedTime / 60))}
              className="h-14 w-14 flex-shrink-0 rounded-2xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300"
              title="Finalizar e Salvar XP"
            >
              <LuTrophy className="h-5 w-5" />
            </Button>
          )}

          <Button
            onClick={resetTimer}
            variant="ghost"
            className="h-14 w-14 flex-shrink-0 rounded-2xl bg-white/[0.04] text-zinc-600 hover:bg-white/[0.07] hover:text-zinc-300"
            title="Reiniciar"
          >
            <LuRotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[10px] font-semibold tracking-[0.2em] text-zinc-800">
        - Can you her the music?
        <p className="t relative z-10 mt-2 text-[10px] font-semibold tracking-[0.2em] text-zinc-800 hover:text-[#007AFF]">
          <a
            rel="noopener noreferrer"
            href="https://youtu.be/ClFyG_x2-9k?si=xZ2aneEOo_OpK1c0&t=45"
            target="_blank"
          >
            - Yes, I can.
          </a>
        </p>
      </p>
    </div>
  );
}
