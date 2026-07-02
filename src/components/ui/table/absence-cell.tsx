"use client";

import { useMemo, useRef, useState } from "react";

import { cn } from "@/src/lib/utils";

interface AbsenceCellProps {
  absences: number;
  maxAbsences: number;
  onUpdate: (changes: { absences?: number; maxAbsences?: number }) => void;
}

function getBarColor(ratio: number): { tw: string; hex: string } {
  if (ratio === 0) return { tw: "bg-gray-500", hex: "#6b7280" };
  if (ratio <= 0.5) return { tw: "bg-[#00FF88]", hex: "#00FF88" };
  if (ratio <= 0.75) return { tw: "bg-yellow-400", hex: "#facc15" };
  if (ratio <= 0.9) return { tw: "bg-orange-500", hex: "#f97316" };
  return { tw: "bg-[#FF3B30]", hex: "#FF3B30" };
}

export const AbsenceCell: React.FC<AbsenceCellProps> = ({
  absences,
  maxAbsences,
  onUpdate,
}) => {
  const [hovered, setHovered] = useState(false);
  const [editingAbsences, setEditingAbsences] = useState(false);
  const [editingMax, setEditingMax] = useState(false);
  const [tempAbsences, setTempAbsences] = useState(String(absences));
  const [tempMax, setTempMax] = useState(String(maxAbsences));
  const [barGhostPct, setBarGhostPct] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const ratio = useMemo(
    () => Math.min(absences / maxAbsences, 1),
    [absences, maxAbsences],
  );
  const { tw: barTw, hex: barHex } = useMemo(() => getBarColor(ratio), [ratio]);

  function commitAbsences() {
    const val = Math.max(0, Math.min(parseInt(tempAbsences) || 0, maxAbsences));
    onUpdate({ absences: val });
    setTempAbsences(String(val));
    setEditingAbsences(false);
  }

  function commitMax() {
    const val = Math.max(1, parseInt(tempMax) || 1);
    onUpdate({ maxAbsences: val, absences: Math.min(absences, val) });
    setTempMax(String(val));
    setEditingMax(false);
  }

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    onUpdate({ absences: Math.round(pct * maxAbsences) });
  }

  function handleBarMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setBarGhostPct(
      Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1)),
    );
  }

  return (
    <div
      className="flex w-full items-center justify-between gap-2 sm:w-auto sm:gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setBarGhostPct(null);
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          ref={barRef}
          onClick={handleBarClick}
          onMouseMove={handleBarMove}
          onMouseLeave={() => setBarGhostPct(null)}
          className="relative h-1.5 w-16 shrink-0 cursor-crosshair overflow-hidden rounded-2xl bg-white/10 sm:h-1.25 sm:w-24"
        >
          {barGhostPct !== null && (
            <div
              className="absolute inset-y-0 left-0 rounded-2xl opacity-20"
              style={{ width: `${barGhostPct * 100}%`, background: barHex }}
            />
          )}
          <div
            className={cn(
              "relative z-10 h-full rounded-2xl transition-all duration-300",
              barTw,
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <div className="flex min-w-10 items-center gap-0.5 font-mono text-xs sm:min-w-13 sm:text-sm">
          {editingAbsences ? (
            <input
              autoFocus
              value={tempAbsences}
              onChange={(e) => setTempAbsences(e.target.value)}
              onBlur={commitAbsences}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitAbsences();
                if (e.key === "Escape") {
                  setTempAbsences(String(absences));
                  setEditingAbsences(false);
                }
              }}
              className="w-6 rounded border border-white/20 bg-white/10 px-0.5 py-px text-center font-mono text-xs outline-none sm:w-8 sm:text-sm"
              style={{ color: barHex }}
            />
          ) : (
            <span
              onClick={() => {
                setEditingAbsences(true);
                setTempAbsences(String(absences));
              }}
              className="cursor-pointer rounded px-0.5 py-px transition-colors hover:bg-white/10 sm:px-1"
              style={{ color: barHex }}
              title="Clique para editar faltas"
            >
              {absences}
            </span>
          )}

          <span className="text-white/25">/</span>

          {editingMax ? (
            <input
              autoFocus
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitMax();
                if (e.key === "Escape") {
                  setTempMax(String(maxAbsences));
                  setEditingMax(false);
                }
              }}
              className="w-6 rounded border border-white/20 bg-white/10 px-0.5 py-px text-center font-mono text-xs text-white/60 outline-none sm:w-8 sm:text-sm"
            />
          ) : (
            <span
              onClick={() => {
                setEditingMax(true);
                setTempMax(String(maxAbsences));
              }}
              className="cursor-pointer rounded px-0.5 py-px text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 sm:px-1"
              title="Clique para editar máximo"
            >
              {maxAbsences}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 transition-all duration-200 sm:gap-1.5",
          hovered
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-1 opacity-0 md:-translate-x-1",
        )}
      >
        <button
          onClick={() => onUpdate({ absences: Math.max(0, absences - 1) })}
          disabled={absences === 0}
          className="flex h-5 w-5 items-center justify-center rounded border border-white/15 text-xs leading-none text-white/50 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-20 sm:h-6 sm:w-6 sm:text-sm"
        >
          −
        </button>
        <button
          onClick={() =>
            onUpdate({ absences: Math.min(maxAbsences, absences + 1) })
          }
          disabled={absences >= maxAbsences}
          className="flex h-5 w-5 items-center justify-center rounded border border-white/15 text-xs leading-none text-white/50 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-20 sm:h-6 sm:w-6 sm:text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
};
