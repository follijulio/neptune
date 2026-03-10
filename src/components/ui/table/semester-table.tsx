"use client";

import { FaListOl } from "react-icons/fa";
import { MdOutlineFolder } from "react-icons/md";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../shadcn-ui/accordion";
import { Badge } from "../../shadcn-ui/badge";
import { Button } from "../../shadcn-ui/button";
import { Card } from "../../shadcn-ui/card";

import { useFilterParam } from "@/src/hooks/useFilterParam";
import { cn } from "@/src/lib/utils";

interface Subject {
  subject_name: string;
  code: string;
  status: string;
  partial_grade: number | null;
}

interface Semester {
  semester: string;
  data: Subject[];
}

interface FilterOption {
  id: string;
  label: string;
}

const CURRICULUM_FILTERS: FilterOption[] = [
  { id: "all", label: "Todas" },
  { id: "completed", label: "Concluídas" },
  { id: "pending", label: "Pendentes" },
  { id: "blocked", label: "Pré-req. Bloqueados" },
];

const DEFAULT_FILTER = "all";
const PASSING_GRADE = 6;

// const SubjectCardSkeleton = () => (
//   <Card className="flex flex-row justify-between rounded-[2px] border border-white/10 bg-transparent p-4">
//     <div className="flex w-full flex-col justify-between gap-4">
//       <section className="space-y-2">
//         <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
//         <div className="h-3 w-1/4 animate-pulse rounded bg-white/10" />
//       </section>
//       <section className="flex flex-row gap-4">
//         <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
//         <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
//       </section>
//     </div>
//     <div>
//       <div className="h-6 w-14 animate-pulse rounded-full bg-white/10" />
//     </div>
//   </Card>
// );

// const SemesterAccordionSkeleton = () => (
//   <div className="flex w-full flex-col gap-3">
//     {[1, 2].map((i) => (
//       <Card
//         key={i}
//         className="min-h-20 justify-center border border-white/20 bg-black p-4 shadow-lg"
//       >
//         <div className="mb-4 h-6 w-32 animate-pulse rounded bg-white/10" />
//         <div className="grid grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map((j) => (
//             <SubjectCardSkeleton key={j} />
//           ))}
//         </div>
//       </Card>
//     ))}
//   </div>
// );

const SemesterTable: React.FC<{ data: Semester[]; isLoading?: boolean }> = ({
  data,
  isLoading,
}) => {
  const { value: activeFilter, setParam: setActiveFilter } = useFilterParam(
    "filterCurriculum",
    {
      defaultValue: DEFAULT_FILTER,
      toggle: true,
    },
  );

  return (
    <Card className="min-h-52 w-full border-0 bg-black p-2 text-white">
      <h2 className="mb-4 text-2xl font-semibold">Grade Curricular</h2>
      <section className="mb-4">
        <FilterButtons
          filters={CURRICULUM_FILTERS}
          activeFilter={activeFilter || DEFAULT_FILTER}
          onFilterChange={setActiveFilter}
          disabled={isLoading}
        />
      </section>

      <section className="relative">
        <div
          className={cn(
            "transition-all duration-300",
            isLoading
              ? "pointer-events-none opacity-40 blur-[1.5px] saturate-50"
              : "blur-0 opacity-100",
          )}
        >
          {data.length === 0 && !isLoading ? (
            <div className="rounded-lg border border-white/10 py-10 text-center text-[#888888]">
              Nenhuma disciplina encontrada para este filtro.
            </div>
          ) : (
            <SemesterAccordion semesters={data} />
          )}
        </div>
      </section>
    </Card>
  );
};

interface FilterButtonsProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  disabled?: boolean;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  disabled,
}) => {
  const getButtonClassName = (isActive: boolean) =>
    cn(
      "transition-all duration-200",
      isActive
        ? "bg-white text-black hover:bg-gray-200"
        : "bg-transparent text-white border border-gray-600 hover:bg-gray-800",
      disabled && "opacity-50 pointer-events-none",
    );

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          onClick={() => {
            if (!disabled) onFilterChange(filter.id);
          }}
          className={getButtonClassName(activeFilter === filter.id)}
          aria-disabled={disabled}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

const SemesterAccordion: React.FC<{ semesters: Semester[] }> = ({
  semesters,
}) => {
  return (
    <Accordion
      type="multiple"
      className="flex w-full flex-col gap-3"
      defaultValue={semesters.map((s) => s.semester)}
    >
      {semesters.map((semester) => (
        <Card
          key={semester.semester}
          className="min-h-20 justify-center border border-white/20 bg-black text-white shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <AccordionItem className="border-0 px-4" value={semester.semester}>
            <AccordionTrigger className="py-4 text-xl font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                {semester.semester}
              </span>
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-4 gap-4 border-t border-white/15 pt-4 pb-2 leading-relaxed text-gray-300">
              {semester.data.map((subject, i) => (
                <SubjectCard key={i} subject={subject} />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Card>
      ))}
    </Accordion>
  );
};

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const { subject_name, code, partial_grade } = subject;
  const isFailing = partial_grade !== null && partial_grade < PASSING_GRADE;

  const gradeColorClass = isFailing
    ? "bg-[#FF3B30]/20 text-[#FF3B30]"
    : "bg-[#00FF88]/20 text-[#00FF88]";

  const dotColorClass = isFailing ? "bg-[#FF3B30]" : "bg-[#00FF88]";

  return (
    <Card className="flex flex-row justify-between rounded-[2px] border border-white/10 bg-transparent p-4">
      <div className="flex flex-col justify-between text-white">
        <section>
          <h3
            className="line-clamp-2 text-lg font-semibold"
            title={subject_name}
          >
            {subject_name}
          </h3>
          <p
            className={
              (cn("text-sm text-white/60"),
              code === "N/A" ? "text-xs font-thin italic" : "")
            }
          >
            {code}
          </p>
        </section>
        <section className="mt-4 flex flex-row gap-4 font-bold">
          <SubjectLink
            href={`/materiais/${code}`}
            icon={MdOutlineFolder}
            label="Materiais"
          />
          <SubjectLink
            href={`/ementas/${code}`}
            icon={FaListOl}
            label="Ementa"
          />
        </section>
      </div>
      <div>
        <Badge
          variant="default"
          className={cn(
            "min-w-14 justify-center gap-2 text-sm",
            gradeColorClass,
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", dotColorClass)} />
          <p>{partial_grade !== null ? partial_grade : "-"}</p>
        </Badge>
      </div>
    </Card>
  );
};

interface SubjectLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const SubjectLink: React.FC<SubjectLinkProps> = ({
  href,
  icon: Icon,
  label,
}) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-[#888888] transition-colors hover:text-[#007AFF]"
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </Link>
  );
};

export default SemesterTable;
export { FilterButtons };
