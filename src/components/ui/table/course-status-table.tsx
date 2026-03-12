"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { LuBookMarked } from "react-icons/lu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shadcn-ui/table";

import { AbsenceCell } from "./absence-cell";
import DrawerAction from "./drawer-action-table";

import { updateSubjectAbsencesAction } from "@/src/app/actions/subject-actions";
import { useFilterParam } from "@/src/hooks/useFilterParam";
import { cn } from "@/src/lib/utils";

export interface CourseStatusCardProps {
  id: string;
  subjectId: string;
  subject_name: string;
  status: string;
  absences: number | null;
  maxAbsences: number | null;
  partial_grade: number | null;
}

const getCurrentSemester = (): string => {
  const now = new Date();
  const period = now.getMonth() < 6 ? 1 : 2;
  return `${now.getFullYear()}.${period}`;
};

const navigateSemester = (
  semester: string,
  direction: "next" | "previous",
): string => {
  const [year, period] = semester.split(".").map(Number);

  if (direction === "next") {
    return period === 1 ? `${year}.2` : `${year + 1}.1`;
  }

  return period === 2 ? `${year}.1` : `${year - 1}.2`;
};

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    aprovado: "text-green-600",
    reprovado: "text-red-600",
  };
  return statusColors[status] ?? "text-[#FFB020]";
};

const SemesterNavigator: React.FC<{
  currentSemester: string;
  onNavigate: (direction: "next" | "previous") => void;
  disabled?: boolean;
}> = ({ currentSemester, onNavigate, disabled }) => (
  <div className="mb-4 flex items-center gap-2">
    <button
      onClick={() => onNavigate("previous")}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-black p-1 transition-all hover:invert sm:h-10 sm:w-10",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      aria-label="Semestre anterior"
    >
      <GrFormPrevious className="inline text-base sm:text-xl" />
    </button>

    <h2 className="w-32 text-center text-base font-semibold sm:w-40 sm:text-lg">
      Semestre: <br className="block sm:hidden" />
      {currentSemester}
    </h2>

    <button
      onClick={() => onNavigate("next")}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-black p-1 transition-all hover:invert sm:h-10 sm:w-10",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      aria-label="Próximo semestre"
    >
      <GrFormNext className="inline text-base sm:text-xl" />
    </button>
  </div>
);

const CourseRowSkeleton = () => (
  <TableRow className="h-full border-b border-white/10">
    <TableCell className="p-3 sm:p-4">
      <div className="flex items-center">
        <div className="h-4 w-4 animate-pulse rounded bg-white/10 sm:h-5 sm:w-5" />
        <div className="ml-2 flex flex-col gap-1.5 sm:ml-4 sm:gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10 sm:h-4 sm:w-32" />
          <div className="hidden h-2 w-12 animate-pulse rounded bg-white/10 sm:block sm:h-3 sm:w-16" />
        </div>
      </div>
    </TableCell>
    <TableCell className="hidden p-3 sm:p-4 md:table-cell">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-white/10 sm:h-3 sm:w-3" />
        <div className="h-3 w-16 animate-pulse rounded bg-white/10 sm:h-4 sm:w-20" />
      </div>
    </TableCell>
    <TableCell className="hidden p-3 sm:p-4 lg:table-cell">
      <div className="flex h-full items-center gap-2 sm:gap-4">
        <div className="h-1.5 w-16 animate-pulse rounded-full bg-white/10 sm:h-2 sm:w-24" />
        <div className="h-3 w-6 animate-pulse rounded bg-white/10 sm:h-4 sm:w-8" />
      </div>
    </TableCell>
    <TableCell className="hidden p-3 sm:table-cell sm:p-4">
      <div className="h-3 w-6 animate-pulse rounded bg-white/10 sm:h-4 sm:w-8" />
    </TableCell>
    <TableCell className="p-3 text-right sm:p-4">
      <div className="ml-auto h-5 w-5 animate-pulse rounded-full bg-white/10 sm:h-6 sm:w-6" />
    </TableCell>
  </TableRow>
);

const CourseRow: React.FC<{ course: CourseStatusCardProps }> = ({ course }) => {
  const [localAbsences, setLocalAbsences] = useState(course.absences ?? 0);
  const [localMaxAbsences] = useState(course.maxAbsences ?? 18);

  const statusColor = useMemo(
    () => getStatusColor(course.status.toLowerCase()),
    [course.status],
  );

  const handleAbsenceUpdate = async (changes: {
    absences?: number;
    maxAbsences?: number;
  }) => {
    const previousAbsences = localAbsences;
    const newAbsences =
      changes.absences !== undefined ? changes.absences : localAbsences;

    setLocalAbsences(newAbsences);

    try {
      if (changes.absences !== undefined) {
        const result = await updateSubjectAbsencesAction(
          course.subjectId,
          newAbsences,
        );
        if (result?.error) throw new Error(result.error);
      }
    } catch (error) {
      setLocalAbsences(previousAbsences);
    }
  };

  return (
    <TableRow className="h-full transition-colors duration-200 hover:bg-white/30">
      <TableCell className="p-3 align-top sm:p-4 sm:align-middle">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <LuBookMarked className="shrink-0 text-base text-[#888888] sm:text-lg" />
            <p className="line-clamp-2 text-sm font-semibold sm:text-base">
              {course.subject_name}
            </p>
          </div>
          <div className="mt-1 flex flex-col gap-2 sm:mt-2 lg:hidden">
            <div className="flex items-center gap-2 md:hidden">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-semibold sm:text-xs",
                  statusColor,
                )}
              >
                <FaCircle className="text-[8px] sm:text-[10px]" />
                {course.status}
              </p>
              <span className="hidden text-xs text-zinc-600 sm:inline">•</span>
              <span className="hidden text-[10px] text-zinc-400 sm:inline sm:text-xs">
                Nota: {course.partial_grade ?? "-"}
              </span>
            </div>
            <div className="w-full">
              <AbsenceCell
                absences={localAbsences}
                maxAbsences={localMaxAbsences}
                onUpdate={handleAbsenceUpdate}
              />
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden p-3 align-middle sm:p-4 md:table-cell">
        <p
          className={cn(
            "flex flex-row items-center gap-1.5 text-xs font-semibold sm:gap-2 sm:text-base",
            statusColor,
          )}
        >
          <FaCircle className="text-[10px] sm:text-xs" />
          {course.status}
        </p>
      </TableCell>

      <TableCell className="hidden h-full p-3 align-middle sm:p-4 lg:table-cell">
        <div className="flex h-full items-center gap-2 sm:gap-4">
          <AbsenceCell
            absences={localAbsences}
            maxAbsences={localMaxAbsences}
            onUpdate={handleAbsenceUpdate}
          />
        </div>
      </TableCell>

      <TableCell className="hidden p-3 align-middle text-xs sm:table-cell sm:p-4 sm:text-sm">
        {course.partial_grade ?? "-"}
      </TableCell>

      <TableCell className="p-3 text-right align-middle sm:p-4">
        <DrawerAction course={course} />
      </TableCell>
    </TableRow>
  );
};

const CoursesTable: React.FC<{
  courses: CourseStatusCardProps[];
  isLoading?: boolean;
}> = ({ courses, isLoading }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-white/10 bg-[#0A0A0A]">
    <Table className="w-full min-w-70">
      <TableHeader>
        <TableRow className="border-b border-white/10 hover:bg-transparent">
          <TableHead className="h-10 text-xs font-bold text-zinc-400 sm:h-12 sm:text-sm">
            DISCIPLINA
          </TableHead>
          <TableHead className="hidden h-10 text-xs font-bold text-zinc-400 sm:h-12 sm:text-sm md:table-cell">
            STATUS
          </TableHead>
          <TableHead className="hidden h-10 text-xs font-bold text-zinc-400 sm:h-12 sm:text-sm lg:table-cell">
            FALTAS
          </TableHead>
          <TableHead className="hidden h-10 text-xs font-bold text-zinc-400 sm:table-cell sm:h-12 sm:text-sm">
            NOTA PARCIAL
          </TableHead>
          <TableHead className="h-10 text-right text-xs font-bold text-zinc-400 sm:h-12 sm:text-sm">
            AÇÃO
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <CourseRowSkeleton key={idx} />
          ))
        ) : courses.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-8 text-center text-sm text-[#888888] sm:py-10 sm:text-base"
            >
              Nenhuma disciplina encontrada para este semestre.
            </TableCell>
          </TableRow>
        ) : (
          courses.map((course, i) => <CourseRow key={i} course={course} />)
        )}
      </TableBody>
    </Table>
  </div>
);

const CourseStatusTable: React.FC<{
  courses: CourseStatusCardProps[];
  isLoading?: boolean;
}> = ({ courses, isLoading }) => {
  const defaultSem = useMemo(() => getCurrentSemester(), []);

  const { value: currentSemester, setParam: setSemester } = useFilterParam(
    "semester",
    {
      defaultValue: defaultSem,
      toggle: false,
    },
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("semester")) {
      setSemester(defaultSem);
    }
  }, [setSemester, defaultSem]);

  const handleSemesterNavigation = (direction: "next" | "previous") => {
    const nextSemester = navigateSemester(
      currentSemester ?? defaultSem,
      direction,
    );
    setSemester(nextSemester);
  };

  return (
    <div className="min-h-75 w-full rounded-lg">
      <SemesterNavigator
        currentSemester={currentSemester ?? defaultSem}
        onNavigate={handleSemesterNavigation}
        disabled={isLoading}
      />
      <CoursesTable courses={courses} isLoading={isLoading} />
    </div>
  );
};

export default CourseStatusTable;
