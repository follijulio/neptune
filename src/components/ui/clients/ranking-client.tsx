"use client";

import { useEffect, useState } from "react";
import {
  LuCrown,
  LuMedal,
  LuOrbit,
  LuTrendingUp,
  LuTrophy,
} from "react-icons/lu";
import Image from "next/image";
import { toast } from "sonner";

import { getLeaderboardAction } from "@/src/app/actions/gamification-actions";

type UserRank = {
  id: string;
  name: string | null;
  image: string | null;
  xp: number;
};

const PLANETARY_LEVELS = [
  {
    name: "Mercúrio",
    xpRequired: 0,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
  },
  {
    name: "Vênus",
    xpRequired: 1200,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    name: "Terra",
    xpRequired: 2500,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    name: "Marte",
    xpRequired: 4000,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    name: "Júpiter",
    xpRequired: 6000,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
  },
  {
    name: "Saturno",
    xpRequired: 7500,
    color: "text-yellow-200",
    bg: "bg-yellow-200/10",
  },
  {
    name: "Urano",
    xpRequired: 9000,
    color: "text-cyan-300",
    bg: "bg-cyan-300/10",
  },
  {
    name: "Netuno",
    xpRequired: 10000,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10",
  },
];

function getPlanetData(xp: number) {
  let currentPlanet = PLANETARY_LEVELS[0];
  let nextPlanet = PLANETARY_LEVELS[1];

  for (let i = 0; i < PLANETARY_LEVELS.length; i++) {
    if (xp >= PLANETARY_LEVELS[i].xpRequired) {
      currentPlanet = PLANETARY_LEVELS[i];
      nextPlanet = PLANETARY_LEVELS[i + 1] || PLANETARY_LEVELS[i];
    }
  }

  const progress =
    nextPlanet.name === currentPlanet.name
      ? 100
      : ((xp - currentPlanet.xpRequired) /
        (nextPlanet.xpRequired - currentPlanet.xpRequired)) *
      100;

  return { currentPlanet, nextPlanet, progress };
}

export default function RankingClient({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const [leaderboard, setLeaderboard] = useState<UserRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLeaderboardAction().then((res) => {
      if (res.success && res.leaderboard) {
        setLeaderboard(res.leaderboard);
      } else {
        toast.error("Falha ao carregar o ranking.");
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-0">
      <header className="mb-10 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div>
          <h1 className="flex items-center justify-center gap-3 text-3xl font-black text-white sm:justify-start">
            <LuOrbit className="h-8 w-8 text-[#007AFF]" />
            Ranking Global
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Compare seu progresso e conquiste o sistema solar.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 shadow-xl">
          <div className="rounded-xl bg-[#007AFF]/10 p-3 text-[#007AFF]">
            <LuTrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              Seu Objetivo
            </p>
            <p className="text-lg font-black text-white">Chegar em Netuno</p>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-[2rem] border border-[#1A1A1A] bg-[#0A0A0A] shadow-2xl">
        <div className="flex items-center gap-4 border-b border-[#1A1A1A] bg-zinc-900/30 p-6 sm:p-8">
          <LuTrophy className="h-6 w-6 text-[#007AFF]" />
          <h2 className="text-lg font-bold tracking-wider text-white uppercase">
            Top Estudantes
          </h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse p-12 text-center font-medium text-zinc-500">
            Sincronizando com os satélites...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center font-medium text-zinc-500">
            O ranking está vazio. Seja o primeiro a estudar!
          </div>
        ) : (
          <div className="flex flex-col">
            {leaderboard.map((user, index) => {
              const { currentPlanet, nextPlanet, progress } = getPlanetData(
                user.xp,
              );
              const isCurrentUser = user.id === currentUserId;

              let rankIcon = (
                <span className="w-8 text-center text-xl font-black text-zinc-500">
                  {index + 1}º
                </span>
              );
              if (index === 0)
                rankIcon = (
                  <LuCrown className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                );
              else if (index === 1)
                rankIcon = (
                  <LuMedal className="h-8 w-8 text-zinc-300 drop-shadow-[0_0_10px_rgba(212,212,216,0.5)]" />
                );
              else if (index === 2)
                rankIcon = (
                  <LuMedal className="h-8 w-8 text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
                );

              return (
                <div
                  key={user.id}
                  className={`flex flex-col items-start justify-between gap-6 border-b border-[#1A1A1A] p-6 transition-colors last:border-0 hover:bg-zinc-900/30 sm:flex-row sm:items-center sm:p-8 ${isCurrentUser ? "relative bg-[#007AFF]/5" : ""
                    }`}
                >
                  {isCurrentUser && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#007AFF] shadow-[0_0_20px_rgba(0,122,255,0.5)]" />
                  )}

                  <div className="flex w-full items-center gap-6 sm:w-auto">
                    <div className="flex w-10 items-center justify-center">
                      {rankIcon}
                    </div>

                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="Avatar"
                          width={50}
                          height={50}
                          className="rounded-2xl border border-zinc-800"
                        />
                      ) : (
                        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-lg font-bold text-zinc-500">
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="flex items-center gap-2 text-lg font-bold text-white">
                          {user.name || "Viajante Anônimo"}
                          {isCurrentUser && (
                            <span className="rounded-2xl bg-[#007AFF] px-2 py-0.5 text-[10px] tracking-wider text-white uppercase">
                              Você
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-zinc-500">
                          {user.xp} XP Acumulado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 pl-16 sm:w-64 sm:pl-0">
                    <div className="flex items-center justify-between text-xs font-bold tracking-widest uppercase">
                      <span className={currentPlanet.color}>
                        {currentPlanet.name}
                      </span>
                      {currentPlanet.name !== "Netuno" && (
                        <span className="text-zinc-600">{nextPlanet.name}</span>
                      )}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-2xl border border-[#1A1A1A] bg-zinc-900">
                      <div
                        className={`h-full ${currentPlanet.color.replace("text-", "bg-")} transition-all duration-1000 ease-out`}
                        style={{
                          width: `${Math.min(100, Math.max(0, progress))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
