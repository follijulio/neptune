"use client";

import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { LuBookMarked } from "react-icons/lu";
import { FaCircle } from "react-icons/fa";
import * as React from "react";
import { cn } from "@/src/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shadcn-ui/table";
import { Progress } from "../../shadcn-ui/chart";
import DrawerAction from "./drawer-action-table";
import { useFilterParam } from "@/src/hooks/useFilterParam";

export interface CourseStatusCardProps {
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

const calculateAbsencePercentage = (
  current: number | null,
  max: number | null,
): number => {
  if (current === 0 || current === null) return 0;
  if (max === 0 || max === null) return 100;
  return Math.min((current / max) * 100, 100);
};

const getAbsenceIndicatorColor = (percentage: number): string => {
  if (percentage <= 50) return "bg-[#00FF88] shadow-[#00FF88]";
  if (percentage <= 75) return "bg-yellow-400 shadow-yellow-400";
  if (percentage <= 90) return "bg-orange-500 shadow-orange-500";
  return "bg-[#FF3B30] shadow-[#FF3B30]";
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
}> = ({ currentSemester, onNavigate }) => (
  <div className="flex items-center gap-2 mb-4">
    <button
      onClick={() => onNavigate("previous")}
      className="p-1 bg-black hover:invert rounded-full cursor-pointer h-8 w-8 flex items-center justify-center"
      aria-label="Semestre anterior"
    >
      <GrFormPrevious className="inline" />
    </button>

    <h2 className="text-lg font-semibold">Semestre: {currentSemester}</h2>

    <button
      onClick={() => onNavigate("next")}
      className="p-1 bg-black hover:invert rounded-full cursor-pointer h-8 w-8 flex items-center justify-center"
      aria-label="Próximo semestre"
    >
      <GrFormNext className="inline" />
    </button>
  </div>
);

const CourseRow: React.FC<{ course: CourseStatusCardProps }> = ({ course }) => {
  const absencePercentage = calculateAbsencePercentage(
    course.absences,
    course.maxAbsences,
  );
  const indicatorColor = getAbsenceIndicatorColor(absencePercentage);

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
            "font-semibold text-base flex flex-row items-center gap-2",
            getStatusColor(course.status),
          )}
        >
          <FaCircle className="text-xs" />
          {course.status}
        </p>
      </TableCell>

      <TableCell className="flex items-center h-full gap-4">
        <Progress
          value={absencePercentage}
          className="w-24"
          indicatorClassName={indicatorColor}
        />
        {course.absences}/{course.maxAbsences}
      </TableCell>

      <TableCell>{course.partial_grade}</TableCell>

      <TableCell className="text-right">
        <DrawerAction course={course} />
      </TableCell>
    </TableRow>
  );
};

const CoursesTable: React.FC<{ courses: CourseStatusCardProps[] }> = ({
  courses,
}) => (
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
      {courses.map((course) => (
        <CourseRow key={course.code} course={course} />
      ))}
    </TableBody>
  </Table>
);

const CourseStatusTable: React.FC<{ courses: CourseStatusCardProps[] }> = ({
  courses,
}) => {
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
    <div className="rounded-lg w-full">
      <SemesterNavigator
        currentSemester={currentSemester ?? getCurrentSemester()}
        onNavigate={handleSemesterNavigation}
      />
      <CoursesTable courses={courses} />
    </div>
  );
};

export default CourseStatusTable;
