"use client";

import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { LuBookMarked } from "react-icons/lu";
import { FaCircle } from "react-icons/fa";
import * as React from "react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shadcn-ui/table";
import DrawerAction from "./drawer-action-table";
import { useFilterParam } from "@/src/hooks/useFilterParam";
import { AbsenceCell } from "./absence-cell";
import { useEnrollmentUpdate } from "@/src/hooks/enrollment/use-enrollment-update";

export interface CourseStatusCardProps {
  id: string;
  subject_name: string;
  code: string;
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
    Aprovado: "text-green-600",
    Reprovado: "text-red-600",
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
        "flex h-8 w-8 items-center justify-center rounded-full bg-black p-1 transition-all hover:invert",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      aria-label="Semestre anterior"
    >
      <GrFormPrevious className="inline" />
    </button>

    <h2 className="w-40 text-center text-lg font-semibold">
      Semestre: {currentSemester}
    </h2>

    <button
      onClick={() => onNavigate("next")}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-black p-1 transition-all hover:invert",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      aria-label="Próximo semestre"
    >
      <GrFormNext className="inline" />
    </button>
  </div>
);

const CourseRowSkeleton = () => (
  <TableRow className="h-full border-b border-white/10">
    <TableCell>
      <div className="flex items-center">
        <div className="h-5 w-5 animate-pulse rounded bg-white/10" />
        <div className="ml-4 flex flex-col gap-2">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </TableCell>

    <TableCell>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
      </div>
    </TableCell>

    <TableCell className="flex h-full items-center gap-4">
      <div className="h-2 w-24 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
    </TableCell>

    <TableCell>
      <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
    </TableCell>

    <TableCell className="text-right">
      <div className="ml-auto h-6 w-6 animate-pulse rounded-full bg-white/10" />
    </TableCell>
  </TableRow>
);

const CourseRow: React.FC<{ course: CourseStatusCardProps }> = ({ course }) => {
  const { execute: updateEnrollment } = useEnrollmentUpdate();

  const [localAbsences, setLocalAbsences] = useState(course.absences ?? 0);
  const [localMaxAbsences, setLocalMaxAbsences] = useState(
    course.maxAbsences ?? 18,
  );

  const handleAbsenceUpdate = async (changes: {
    absences?: number;
    maxAbsences?: number;
  }) => {
    const previousAbsences = localAbsences;
    const previousMaxAbsences = localMaxAbsences;

    const newAbsences =
      changes.absences !== undefined ? changes.absences : localAbsences;
    const newMaxAbsences =
      changes.maxAbsences !== undefined
        ? changes.maxAbsences
        : localMaxAbsences;

    setLocalAbsences(newAbsences);
    setLocalMaxAbsences(newMaxAbsences);

    try {
      const result = await updateEnrollment({
        id: course.id,
        absences: newAbsences,
        maxAbsences: newMaxAbsences,
      });

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Falha ao salvar faltas:", error);
      setLocalAbsences(previousAbsences);
      setLocalMaxAbsences(previousMaxAbsences);
    }
  };

  return (
    <TableRow className="h-full transition-colors duration-200 hover:bg-white/30">
      <TableCell>
        <div className="flex items-center">
          <LuBookMarked className="text-lg text-[#888888]" />
          <div className="ml-4">
            <p className="text-base font-semibold">{course.subject_name}</p>
            <p className="text-sm font-light text-[#888888]">{course.code}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <p
          className={cn(
            "flex flex-row items-center gap-2 text-base font-semibold",
            getStatusColor(course.status),
          )}
        >
          <FaCircle className="text-xs" />
          {course.status}
        </p>
      </TableCell>

      <TableCell className="flex h-full items-center gap-4">
        <AbsenceCell
          absences={localAbsences}
          maxAbsences={localMaxAbsences}
          onUpdate={handleAbsenceUpdate}
        />
      </TableCell>

      <TableCell>{course.partial_grade}</TableCell>

      <TableCell className="text-right">
        <DrawerAction course={course} />
      </TableCell>
    </TableRow>
  );
};

const CoursesTable: React.FC<{
  courses: CourseStatusCardProps[];
  isLoading?: boolean;
}> = ({ courses, isLoading }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>DISCIPLINA</TableHead>
        <TableHead>STATUS</TableHead>
        <TableHead>FALTAS</TableHead>
        <TableHead>NOTA PARCIAL</TableHead>
        <TableHead className="text-right">AÇÃO</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {isLoading ? (
        Array.from({ length: 3 }).map((_, idx) => (
          <CourseRowSkeleton key={idx} />
        ))
      ) : courses.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="py-10 text-center text-[#888888]">
            Nenhuma disciplina encontrada para este semestre.
          </TableCell>
        </TableRow>
      ) : (
        courses.map((course) => <CourseRow key={course.code} course={course} />)
      )}
    </TableBody>
  </Table>
);

const CourseStatusTable: React.FC<{
  courses: CourseStatusCardProps[];
  isLoading?: boolean;
}> = ({ courses, isLoading }) => {
  const { value: currentSemester, setParam: setSemester } = useFilterParam(
    "semester",
    {
      defaultValue: getCurrentSemester(),
      toggle: false,
    },
  );

  const handleSemesterNavigation = (direction: "next" | "previous") => {
    const nextSemester = navigateSemester(
      currentSemester ?? getCurrentSemester(),
      direction,
    );
    setSemester(nextSemester);
  };

  return (
    <div className="min-h-[300px] w-full rounded-lg">
      <SemesterNavigator
        currentSemester={currentSemester ?? getCurrentSemester()}
        onNavigate={handleSemesterNavigation}
        disabled={isLoading}
      />
      <CoursesTable courses={courses} isLoading={isLoading} />
    </div>
  );
};

export default CourseStatusTable;
