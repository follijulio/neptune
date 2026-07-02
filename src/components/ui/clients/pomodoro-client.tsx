"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

interface PomodoroConfig {
  time: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  pill: string;
  glow: string;
  activeDot: string;
}

interface TimerConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  pill: string;
  glow: string;
  activeDot: string;
}

const POMODORO_CONFIG: Record<PomodoroPhase, PomodoroConfig> = {
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

interface MonthlyStatsProps {
  monthlyMinutes: number;
}

interface ModeToggleProps {
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

interface PhaseButtonProps {
  phase: PomodoroPhase;
  isSelected: boolean;
  config: PomodoroConfig;
  onPhaseChange: (phase: PomodoroPhase) => void;
}

interface PhaseSelectorProps {
  appMode: AppMode;
  phase: PomodoroPhase;
  onPhaseChange: (phase: PomodoroPhase) => void;
}

interface TimerDisplayProps {
  formattedDisplay: string;
  currentConfig: PomodoroConfig | TimerConfig;
}

interface ControlButtonsProps {
  isActive: boolean;
  appMode: AppMode;
  elapsedTime: number;
  onToggle: () => void;
  onFinish: () => void;
  onReset: () => void;
}

interface StatusIndicatorProps {
  currentConfig: PomodoroConfig | TimerConfig;
  isActive: boolean;
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const MonthlyStats = ({ monthlyMinutes }: MonthlyStatsProps) => (
  <div className="absolute top-6 right-6 z-10 flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 backdrop-blur-sm">
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
);

const ModeToggle = ({ appMode, onModeChange }: ModeToggleProps) => (
  <div className="relative z-10 mb-8 flex rounded-xl border border-white/5 bg-white/3 p-1 backdrop-blur-sm">
    {(["pomodoro", "timer"] as AppMode[]).map((mode) => (
      <button
        key={mode}
        onClick={() => onModeChange(mode)}
        className={`relative flex items-center gap-2 rounded-xl px-7 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${appMode === mode ? "text-white" : "text-zinc-600 hover:text-zinc-400"
          }`}
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
);

const PhaseButton = ({
  phase,
  isSelected,
  config,
  onPhaseChange,
}: PhaseButtonProps) => {
  const Icon = config.icon;
  const phaseLabel = {
    focus: "Foco",
    shortBreak: "Pausa",
    longBreak: "Descanso",
  }[phase];

  return (
    <button
      onClick={() => onPhaseChange(phase)}
      className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${isSelected
        ? config.pill
        : "border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400"
        }`}
    >
      <Icon className="h-3 w-3" />
      {phaseLabel}
    </button>
  );
};

const PhaseSelector = ({
  appMode,
  phase,
  onPhaseChange,
}: PhaseSelectorProps) => (
  <div
    className={`mb-8 w-full overflow-hidden transition-all duration-500 ease-in-out ${appMode === "pomodoro" ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
      }`}
  >
    <div className="flex items-center justify-center gap-2">
      {(Object.keys(POMODORO_CONFIG) as PomodoroPhase[]).map((p) => {
        const cfg = POMODORO_CONFIG[p];
        const isSelected = phase === p && appMode === "pomodoro";
        return (
          <PhaseButton
            key={p}
            phase={p}
            isSelected={isSelected}
            config={cfg}
            onPhaseChange={onPhaseChange}
          />
        );
      })}
    </div>
  </div>
);

const StatusIndicator = ({ currentConfig, isActive }: StatusIndicatorProps) => {
  const Icon = currentConfig.icon;
  return (
    <div
      className={`mb-6 flex items-center gap-2 rounded-2xl px-4 py-1.5 ${currentConfig.bg}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-2xl ${currentConfig.activeDot} ${isActive ? "animate-pulse" : ""
          }`}
      />
      <Icon className={`h-3.5 w-3.5 ${currentConfig.color}`} />
      <span
        className={`text-[10px] font-black tracking-[0.18em] uppercase ${currentConfig.color}`}
      >
        {currentConfig.label}
      </span>
    </div>
  );
};

const TimerDisplay = ({ formattedDisplay }: TimerDisplayProps) => (
  <div className="relative mb-10 select-none">
    <h1 className="bg-linear-to-b from-white via-white/90 to-zinc-500 bg-clip-text text-[clamp(80px,20vw,108px)] leading-none font-black text-transparent tabular-nums">
      {formattedDisplay}
    </h1>
    <div
      className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-[#0A0A0A] opacity-60 select-none"
      aria-hidden
    />
  </div>
);

const ControlButtons = ({
  isActive,
  appMode,
  elapsedTime,
  onToggle,
  onFinish,
  onReset,
}: ControlButtonsProps) => (
  <div className="flex w-full items-center gap-3">
    <Button
      onClick={onToggle}
      className={`h-14 flex-1 rounded-xl text-sm font-black tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isActive
        ? "bg-white/[0.07] text-white hover:bg-white/10"
        : "bg-[#007AFF] text-white shadow-[0_0_28px_rgba(0,122,255,0.35)] hover:bg-[#0066d6] hover:shadow-[0_0_40px_rgba(0,122,255,0.45)]"
        }`}
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
        onClick={onFinish}
        className="h-14 w-14 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300"
        title="Finalizar e Salvar XP"
      >
        <LuTrophy className="h-5 w-5" />
      </Button>
    )}

    <Button
      onClick={onReset}
      variant="ghost"
      className="h-14 w-14 shrink-0 rounded-xl bg-white/4 text-zinc-600 hover:bg-white/7 hover:text-zinc-300"
      title="Reiniciar"
    >
      <LuRotateCcw className="h-4 w-4" />
    </Button>
  </div>
);

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <a
    rel="noopener noreferrer"
    href={href}
    target="_blank"
    className="text-zinc-800 transition-colors hover:text-[#007AFF]"
  >
    {children}
  </a>
);

const Footer = () => (
  <div className="relative z-10 mt-8 space-y-2 text-center">
    <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-800">
      - Can you hear the music?
    </p>
    <p className="text-[10px] font-semibold tracking-[0.2em]">
      <FooterLink href="https://youtu.be/ClFyG_x2-9k?si=xZ2aneEOo_OpK1c0&t=45">
        - Yes, I can.
      </FooterLink>
    </p>
  </div>
);

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

  const playAlarm = useCallback(() => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    );
    audio.play().catch(() => { });
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (appMode === "pomodoro") {
      setTimeLeft(POMODORO_CONFIG[phase].time);
    } else {
      setElapsedTime(0);
    }
  }, [appMode, phase]);

  const handleFinishSession = useCallback(
    async (minutes: number) => {
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
    },
    [appMode, playAlarm, resetTimer],
  );

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
  }, [isActive, appMode, phase, handleFinishSession, playAlarm]);

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

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleFinish = () => {
    handleFinishSession(Math.floor(elapsedTime / 60));
  };

  const formattedDisplay = useMemo(() => {
    const s = appMode === "timer" ? elapsedTime : timeLeft;
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }, [timeLeft, elapsedTime, appMode]);

  const currentConfig: PomodoroConfig | TimerConfig =
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

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#050505] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(0,122,255,0.07)_0%,transparent_70%)]" />

      <MonthlyStats monthlyMinutes={monthlyMinutes} />

      <ModeToggle appMode={appMode} onModeChange={switchAppMode} />

      <div
        className={`relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-white/6 bg-[#0A0A0A] px-8 py-10 transition-shadow duration-700 ${isActive ? currentConfig.glow : "shadow-none"
          }`}
      >
        <div className="absolute top-0 right-8 left-8 h-px rounded-2xl bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <PhaseSelector
          appMode={appMode}
          phase={phase}
          onPhaseChange={switchPhase}
        />

        <StatusIndicator currentConfig={currentConfig} isActive={isActive} />

        <TimerDisplay
          formattedDisplay={formattedDisplay}
          currentConfig={currentConfig}
        />

        <ControlButtons
          isActive={isActive}
          appMode={appMode}
          elapsedTime={elapsedTime}
          onToggle={handleToggleTimer}
          onFinish={handleFinish}
          onReset={resetTimer}
        />
      </div>

      <Footer />
    </div>
  );
}