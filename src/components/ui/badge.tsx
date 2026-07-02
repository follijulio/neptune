"use client";

import { FiHexagon } from "react-icons/fi";

import { getUserPlanet } from "@/src/lib/gamification";

export default function UserBadge({
  userXp,
  userName,
}: {
  userXp: number;
  userName: string;
}) {
  const { current, progress } = getUserPlanet(userXp);
  const isNetuno = current.name === "Netuno";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 transition-all hover:bg-zinc-900/50">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1A1A1A] bg-black">
        <FiHexagon
          className={`h-5 w-5 animate-[spin_10s_linear_infinite] ${current.color} ${isNetuno ? "drop-shadow-[0_0_10px_rgba(0,122,255,0.8)]" : ""
            }`}
        />

        {isNetuno && (
          <div className="absolute inset-0 animate-pulse rounded-2xl border border-[#007AFF]/30 bg-[#007AFF]/5 blur-sm" />
        )}

        <svg className="absolute -inset-1 h-[52px] w-[52px] -rotate-90">
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray={150}
            strokeDashoffset={150 - (150 * progress) / 100}
            className={`transition-all duration-1000 ${current.color} opacity-40`}
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <p className="text-sm font-black text-white">{userName}</p>
        <p
          className={`text-[10px] font-bold tracking-widest uppercase ${current.color}`}
        >
          {current.name}
        </p>
      </div>
    </div>
  );
}
