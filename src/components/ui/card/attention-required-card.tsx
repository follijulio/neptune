import { cn } from "@/src/lib/utils";
import { RiErrorWarningLine } from "react-icons/ri";

// Types
interface Subject {
  subject_name: string;
  absences: number;
  maxAbsences: number;
}

interface AttentionRequiredCardProps {
  subjects: Subject[];
}

// Constants
const CRITICAL_ATTENDANCE_THRESHOLD = 75;

const INDICATION_COLORS = {
  SAFE: "text-[#FFFFFF]", // Fixed syntax error
  WARNING: "text-[#FFB020]",
  DANGER: "text-[#FF8C00]",
  CRITICAL: "text-[#FF3B30]",
} as const;

// Utilities
const calculateAttendanceRate = (
  absences: number,
  maxAbsences: number,
): number => {
  if (maxAbsences === 0) return 0;
  return (absences / maxAbsences) * 100;
};

const isCriticalSubject = (subject: Subject): boolean => {
  const attendanceRate = calculateAttendanceRate(
    subject.absences,
    subject.maxAbsences,
  );
  return attendanceRate >= CRITICAL_ATTENDANCE_THRESHOLD;
};

const getCriticalSubjectsCount = (subjects: Subject[]): number => {
  return subjects.filter(isCriticalSubject).length;
};

const getIndicationColor = (subjects: Subject[]): string => {
  if (subjects.length === 0) return INDICATION_COLORS.SAFE;

  const criticalCount = getCriticalSubjectsCount(subjects);
  const criticalPercentage = (criticalCount / subjects.length) * 100;

  if (criticalPercentage <= 25) return INDICATION_COLORS.SAFE;
  if (criticalPercentage <= 50) return INDICATION_COLORS.WARNING;
  if (criticalPercentage <= 75) return INDICATION_COLORS.DANGER;
  return INDICATION_COLORS.CRITICAL;
};

const getPluralSuffix = (count: number): string => {
  return count !== 1 ? "s" : "";
};

// Component
const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({
  subjects,
}) => {
  const criticalCount = getCriticalSubjectsCount(subjects);
  const pluralSuffix = getPluralSuffix(criticalCount);
  const indicationColor = getIndicationColor(subjects);

  return (
    <div className="w-full h-72 p-4 rounded-3xl border border-white/50 bg-transparent text-white flex flex-col gap-8">
      <header className="flex items-center gap-2 font-semibold text-[#888888]">
        <RiErrorWarningLine className="inline" />
        Atenção Requerida
      </header>

      <div className={cn("text-6xl font-light", indicationColor)}>
        {criticalCount}
      </div>

      <footer className="text-[#888888]">
        Disciplina{pluralSuffix} próxima{pluralSuffix} do limite de falta
        {pluralSuffix}.
      </footer>
    </div>
  );
};

export default AttentionRequiredCard;
