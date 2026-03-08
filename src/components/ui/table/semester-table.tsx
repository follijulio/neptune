"use client";

import { cn } from "@/src/lib/utils";
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
import { MdOutlineFolder } from "react-icons/md";
import { FaListOl } from "react-icons/fa";
import Link from "next/link";

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

const SubjectCardSkeleton = () => (
  <Card className="border border-white/10 bg-transparent rounded-[2px] flex flex-row justify-between p-4">
    <div className="flex flex-col justify-between gap-4 w-full">
      <section className="space-y-2">
        <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-white/10 rounded animate-pulse" />
      </section>
      <section className="flex flex-row gap-4">
        <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
      </section>
    </div>
    <div>
      <div className="h-6 w-14 bg-white/10 rounded-full animate-pulse" />
    </div>
  </Card>
);

const SemesterAccordionSkeleton = () => (
  <div className="w-full flex flex-col gap-3">
    {[1, 2].map((i) => (
      <Card
        key={i}
        className="border bg-black shadow-lg border-white/20 min-h-20 justify-center p-4"
      >
        <div className="h-6 w-32 bg-white/10 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((j) => (
            <SubjectCardSkeleton key={j} />
          ))}
        </div>
      </Card>
    ))}
  </div>
);

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
    <Card className="min-h-52 w-full bg-black text-white p-2 border-0">
      <h2 className="text-2xl font-semibold mb-4">Grade Curricular</h2>
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
              ? "opacity-40 blur-[1.5px] pointer-events-none saturate-50"
              : "opacity-100 blur-0",
          )}
        >
          {data.length === 0 && !isLoading ? (
            <div className="py-10 text-center text-[#888888] border border-white/10 rounded-lg">
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
      className="w-full flex flex-col gap-3"
      defaultValue={semesters.map((s) => s.semester)}
    >
      {semesters.map((semester) => (
        <Card
          key={semester.semester}
          className="border bg-black text-white shadow-lg border-white/20 hover:shadow-xl transition-all duration-300 min-h-20 justify-center"
        >
          <AccordionItem className="px-4 border-0" value={semester.semester}>
            <AccordionTrigger className="text-xl font-semibold py-4 hover:no-underline">
              <span className="flex items-center gap-2">
                {semester.semester}
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-white/15 pt-4 pb-2 text-gray-300 leading-relaxed grid grid-cols-4 gap-4">
              {semester.data.map((subject) => (
                <SubjectCard key={subject.code} subject={subject} />
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
  const isFailing = partial_grade !== null && partial_grade <= PASSING_GRADE;

  const gradeColorClass = isFailing
    ? "bg-[#FF3B30]/20 text-[#FF3B30]"
    : "bg-[#00FF88]/20 text-[#00FF88]";

  const dotColorClass = isFailing ? "bg-[#FF3B30]" : "bg-[#00FF88]";

  return (
    <Card className="border border-white/10 bg-transparent rounded-[2px] flex flex-row justify-between p-4">
      <div className="text-white flex flex-col justify-between">
        <section>
          <h3
            className="text-lg font-semibold line-clamp-2"
            title={subject_name}
          >
            {subject_name}
          </h3>
          <p className="text-sm text-white/60">{code}</p>
        </section>
        <section className="flex flex-row gap-4 font-bold mt-4">
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
            "text-sm gap-2 min-w-14 justify-center",
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
      className="flex items-center gap-2 text-[#888888] hover:text-[#007AFF] transition-colors"
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </Link>
  );
};

export default SemesterTable;
export { FilterButtons };
