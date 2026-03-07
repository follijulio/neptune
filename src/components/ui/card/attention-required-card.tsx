import { cn } from "@/src/lib/utils";
import { RiErrorWarningLine } from "react-icons/ri";

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
    <div className="w-full h-72 p-4 rounded-3xl border border-white/50 bg-transparent text-white flex flex-col gap-8">
      <header className="flex items-center gap-2 font-semibold text-[#888888]">
        <RiErrorWarningLine className="inline" />
        Atenção Requerida
      </header>

      <div className={cn("text-6xl font-light", severityColor)}>
        {criticalSubjectsCount}
      </div>

      <footer className="text-[#888888]">
        Disciplina{suffix} próxima{suffix} do limite de falta{suffix}.
      </footer>
    </div>
  );
};
