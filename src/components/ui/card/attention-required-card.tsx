"use client";

import { RiErrorWarningLine } from "react-icons/ri";
import { cn } from "@/src/lib/utils";

interface Subject {
  subject_name: string;
  absences: number | null;
  maxAbsences: number | null;
}

interface AttentionRequiredCardProps {
  subjects: Subject[];
}

const CRITICAL_ATTENDANCE_THRESHOLD = 75;

const SEVERITY_COLORS = {
  SAFE: "text-[#FFFFFF]",
  WARNING: "text-[#FFB020]",
  DANGER: "text-[#FF8C00]",
  CRITICAL: "text-[#FF3B30]",
} as const;

const calculateAttendancePercentage = (
  absences: number | null,
  maxAbsences: number | null,
): number => {
  if (maxAbsences === 0 || maxAbsences === null) return 0;
  return (
    ((absences !== null ? absences : 0) /
      (maxAbsences !== null ? maxAbsences : 1)) *
    100
  );
};

const isSubjectCritical = (subject: Subject): boolean =>
  calculateAttendancePercentage(subject.absences, subject.maxAbsences) >=
  CRITICAL_ATTENDANCE_THRESHOLD;

const countCriticalSubjects = (subjects: Subject[]): number =>
  subjects.filter(isSubjectCritical).length;

const getSeverityColor = (subjects: Subject[]): string => {
  if (subjects.length === 0) return SEVERITY_COLORS.SAFE;
  const criticalCount = countCriticalSubjects(subjects);
  const criticalRatio = (criticalCount / subjects.length) * 100;
  if (criticalRatio <= 25) return SEVERITY_COLORS.SAFE;
  if (criticalRatio <= 50) return SEVERITY_COLORS.WARNING;
  if (criticalRatio <= 75) return SEVERITY_COLORS.DANGER;
  return SEVERITY_COLORS.CRITICAL;
};

const pluralize = (count: number): string => (count !== 1 ? "s" : "");

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({
  subjects,
}) => {
  const criticalSubjectsCount = countCriticalSubjects(subjects);
  const suffix = pluralize(criticalSubjectsCount);
  const severityColor = getSeverityColor(subjects);

  return (
    <div className="flex h-full w-full flex-col gap-6 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 text-white shadow-lg">
      <header className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        <RiErrorWarningLine className="shrink-0" />
        Atenção Requerida
      </header>

      <div
        className={cn("flex-1 text-6xl leading-none font-light", severityColor)}
      >
        {criticalSubjectsCount}
      </div>

      <footer className="text-xs text-zinc-500">
        Disciplina{suffix} próxima{suffix} do limite de falta{suffix}.
      </footer>
    </div>
  );
};
