"use client";

import { useMemo } from "react";

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
  id: string;
  subject_name: string;
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
    <Card className="min-h-52 w-full border-0 bg-black p-2 text-white sm:p-4">
      <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
        Grade Curricular
      </h2>
      <section className="custom-scrollbar mb-4 overflow-x-auto pb-2">
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
            <div className="rounded-lg border border-white/10 py-10 text-center text-sm text-[#888888] sm:text-base">
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
      "transition-all duration-200 whitespace-nowrap text-xs sm:text-sm h-9 sm:h-10",
      isActive
        ? "bg-white text-black hover:bg-gray-200"
        : "bg-transparent text-white border border-gray-600 hover:bg-gray-800",
      disabled && "opacity-50 pointer-events-none",
    );

  return (
    <div className="flex flex-nowrap gap-2 sm:flex-wrap">
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
  const defaultValues = useMemo(
    () => semesters.map((s) => s.semester),
    [semesters],
  );

  return (
    <Accordion
      type="multiple"
      className="flex w-full flex-col gap-3 sm:gap-4"
      defaultValue={defaultValues}
    >
      {semesters.map((semester) => (
        <Card
          key={semester.semester}
          className="min-h-20 justify-center border border-white/20 bg-black text-white shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <AccordionItem
            className="border-0 px-3 sm:px-4"
            value={semester.semester}
          >
            <AccordionTrigger className="py-3 text-lg font-semibold hover:no-underline sm:py-4 sm:text-xl">
              <span className="flex items-center gap-2">
                {semester.semester}
              </span>
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-3 border-t border-white/15 pt-4 pb-2 leading-relaxed text-gray-300 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
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
  const { subject_name, partial_grade } = subject;

  const isFailing = useMemo(
    () => partial_grade !== null && partial_grade < PASSING_GRADE,
    [partial_grade],
  );

  const gradeColorClass = isFailing
    ? "bg-[#FF3B30]/20 text-[#FF3B30]"
    : "bg-[#00FF88]/20 text-[#00FF88]";

  const dotColorClass = isFailing ? "bg-[#FF3B30]" : "bg-[#00FF88]";

  return (
    <Card className="flex flex-row justify-between gap-3 rounded-[2px] border border-white/10 bg-transparent p-3 sm:p-4">
      <div className="flex w-full flex-col justify-between pr-2 text-white">
        <section>
          <h3
            className="line-clamp-2 text-base font-semibold sm:text-lg"
            title={subject_name}
          >
            {subject_name}
          </h3>
        </section>
      </div>
      <div className="shrink-0">
        <Badge
          variant="default"
          className={cn(
            "min-w-12 justify-center gap-1.5 text-xs sm:min-w-14 sm:gap-2 sm:text-sm",
            gradeColorClass,
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
              dotColorClass,
            )}
          />
          <p>{partial_grade !== null ? partial_grade : "-"}</p>
        </Badge>
      </div>
    </Card>
  );
};

export default SemesterTable;
export { FilterButtons };
