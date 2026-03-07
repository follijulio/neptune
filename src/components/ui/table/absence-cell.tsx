"use client";

import { useRef, useState } from "react";
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

  const ratio = Math.min(absences / maxAbsences, 1);
  const { tw: barTw, hex: barHex } = getBarColor(ratio);

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
      className="flex items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setBarGhostPct(null);
      }}
    >
      <div
        ref={barRef}
        onClick={handleBarClick}
        onMouseMove={handleBarMove}
        onMouseLeave={() => setBarGhostPct(null)}
        className="relative w-24 h-1.25 rounded-full bg-white/10 cursor-crosshair overflow-hidden flex-shrink-0"
      >
        {barGhostPct !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-20"
            style={{ width: `${barGhostPct * 100}%`, background: barHex }}
          />
        )}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 relative z-10",
            barTw,
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-0.5 text-sm font-mono min-w-13">
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
            className="w-8 text-center bg-white/10 border border-white/20 rounded px-0.5 py-px outline-none text-sm font-mono"
            style={{ color: barHex }}
          />
        ) : (
          <span
            onClick={() => {
              setEditingAbsences(true);
              setTempAbsences(String(absences));
            }}
            className="px-1 py-px rounded cursor-pointer hover:bg-white/10 transition-colors"
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
            className="w-8 text-center bg-white/10 border border-white/20 rounded px-0.5 py-px outline-none text-sm font-mono text-white/60"
          />
        ) : (
          <span
            onClick={() => {
              setEditingMax(true);
              setTempMax(String(maxAbsences));
            }}
            className="px-1 py-px rounded cursor-pointer text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
            title="Clique para editar máximo"
          >
            {maxAbsences}
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 transition-all duration-200",
          hovered
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-1 pointer-events-none",
        )}
      >
        <button
          onClick={() => onUpdate({ absences: Math.max(0, absences - 1) })}
          disabled={absences === 0}
          className="w-6 h-6 flex items-center justify-center rounded border border-white/15 text-white/50 hover:border-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm leading-none"
        >
          −
        </button>
        <button
          onClick={() =>
            onUpdate({ absences: Math.min(maxAbsences, absences + 1) })
          }
          disabled={absences >= maxAbsences}
          className="w-6 h-6 flex items-center justify-center rounded border border-white/15 text-white/50 hover:border-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
};
