"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import * as React from "react";
import { cn } from "@/src/lib/utils";

import { Progress } from "../../shadcn-ui/chart";
import { FaCircle } from "react-icons/fa";
import DrawerAction from "./drawer-action-table";
import { useFilterParam } from "@/src/hooks/useFilterParam";

export interface CourseStatusCardProps {
  subject_name: string;
  code: string;
  status: string;
  absences: number;
  maxAbsences: number;
  partial_grade: number;
}

export const getDefaultSemester = (): string => {
  const now = new Date();
  const part = now.getMonth() < 6 ? 1 : 2;
  return `${now.getFullYear()}.${part}`;
};

export const shiftSemester = (
  semester: string,
  direction: "next" | "previous",
): string => {
  const [yearString, partString] = semester.split(".");
  const year = Number(yearString);
  const part = Number(partString);

  const isNext = direction === "next";

  if (isNext) {
    return part === 1 ? `${year}.2` : `${year + 1}.1`;
  } else {
    return part === 2 ? `${year}.1` : `${year - 1}.2`;
  }
};

const CourseStatusTable: React.FC<{ courses: CourseStatusCardProps[] }> = ({
  courses,
}) => {
  const { value: currentSemester, setParam: setSemester } = useFilterParam(
    "semester",
    {
      defaultValue: getDefaultSemester(),
      toggle: false,
    },
  );

  const updateSemester = (direction: "next" | "previous") => {
    setSemester(shiftSemester(currentSemester ?? getDefaultSemester(), direction));
  };

  return (
    <div className="rounded-lg w-full">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => updateSemester("previous")}
          className="p-1 bg-black hover:invert rounded-full cursor-pointer h-8 w-8 flex items-center justify-center"
          aria-label="Semestre anterior"
        >
          <GrFormPrevious className="inline" />
        </button>

        <h2 className="text-lg font-semibold">Semestre: {currentSemester}</h2>

        <button
          onClick={() => updateSemester("next")}
          className="p-1 bg-black hover:invert rounded-full cursor-pointer h-8 w-8 flex items-center justify-center"
          aria-label="Próximo semestre"
        >
          <GrFormNext className="inline" />
        </button>
      </div>

      <TableStatusCard courses={courses} />
    </div>
  );
};

const TableStatusCard: React.FC<{ courses: CourseStatusCardProps[] }> = ({
  courses,
}) => {
  return (
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
          <ItemOfTable key={course.code} course={course} />
        ))}
      </TableBody>
    </Table>
  );
};

function percentageAbsences(a: number, b: number) {
  if (a === 0) return 0;
  return Math.min((a / b) * 100, 100);
}

function getIndicationn(value: number) {
  if (value <= 50) return "bg-[#00FF88] shadow-[#00FF88]";
  if (value <= 75) return "bg-yellow-400 shadow-yellow-400";
  if (value <= 90) return "bg-orange-500 shadow-orange-500";
  return "bg-[#FF3B30] shadow-[#FF3B30]";
}

function getColor(status: string): import("clsx").ClassValue {
  switch (status) {
    case "Aprovado":
      return "text-green-600";
    case "Reprovado":
      return "text-red-600";
    default:
      return "text-[#FFB020]";
  }
}

const ItemOfTable: React.FC<{ course: CourseStatusCardProps }> = ({
  course,
}) => {
  const percentage = percentageAbsences(course.absences, course.maxAbsences);
  const indicatorClassName = getIndicationn(percentage);

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
            getColor(course.status),
          )}
        >
          <FaCircle className="text-xs" />
          {course.status}
        </p>
      </TableCell>
      <TableCell className="flex items-center h-full gap-4">
        <Progress
          value={percentageAbsences(course.absences, course.maxAbsences)}
          className="w-24"
          indicatorClassName={indicatorClassName}
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

export default CourseStatusTable;
