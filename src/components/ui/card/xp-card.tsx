"use client";

import { FiHexagon } from "react-icons/fi";
import { IoMdPlanet } from "react-icons/io";

import { getUserPlanet } from "@/src/lib/gamification";

interface XpCardProps {
  xp: number;
}

export function XpCard({ xp }: XpCardProps) {
  const { current, next, progress } = getUserPlanet(xp);
  const progressBarClass = current.color.replace("text-", "bg-");

  return (
    <div className="flex h-full min-h-[220px] flex-col justify-between rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 shadow-lg sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <header className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          <IoMdPlanet className="shrink-0" />
          STATUS PLANETÁRIO
        </header>
        <FiHexagon
          className={`h-6 w-6 shrink-0 ${current.color} animate-[spin_8s_linear_infinite]`}
        />
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <span
          className={`max-w-full text-center text-[clamp(1.125rem,2.6vw,2.25rem)] leading-tight tracking-[0.08em] wrap-break-word whitespace-normal text-white`}
        >
          {current.name}
        </span>
        <span className="mt-1 text-xs font-medium text-zinc-500 sm:text-sm">
          {xp.toLocaleString()} XP acumulado
        </span>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold tracking-wider text-zinc-500 uppercase">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
          <div
            className={`h-full ${progressBarClass} transition-[width] duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-[10px] font-bold text-zinc-600 uppercase">
          Rumo a {next.name}
        </div>
      </div>
    </div>
  );
}
