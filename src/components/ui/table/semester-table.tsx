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

const SemesterTable: React.FC<{ data: Semester[] }> = ({ data }) => {
  const { value: activeFilter, setParam: setActiveFilter } = useFilterParam(
    "filterCurriculum",
    {
      defaultValue: DEFAULT_FILTER,
      toggle: true,
    },
  );

  return (
    <Card className="h-52 w-full bg-black text-white p-2 border-0">
      <h2 className="text-2xl font-semibold mb-4">Grade Curricular</h2>
      <section>
        <FilterButtons
          filters={CURRICULUM_FILTERS}
          activeFilter={activeFilter || DEFAULT_FILTER}
          onFilterChange={setActiveFilter}
        />
      </section>
      <section>
        <SemesterAccordion semesters={data} />
      </section>
    </Card>
  );
};

interface FilterButtonsProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  filters,
  activeFilter,
  onFilterChange,
}) => {
  const getButtonClassName = (isActive: boolean) =>
    cn(
      "transition-colors duration-200",
      isActive
        ? "bg-white text-black hover:bg-gray-200"
        : "bg-transparent text-white border border-gray-600 hover:bg-gray-800",
    );

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={getButtonClassName(activeFilter === filter.id)}
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
      defaultValue={["Semestre 1"]}
    >
      {semesters.map((semester) => (
        <Card
          key={semester.semester}
          className="border bg-black text-white shadow-lg border-white/20 hover:shadow-xl transition-all duration-300 min-h-20 justify-center"
        >
          <AccordionItem className="px-4 border-0" value={semester.semester}>
            <AccordionTrigger className="text-xl font-semibold py-4">
              <span className="flex items-center gap-2">
                {semester.semester}
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-white/15 pt-4 pb-2 text-gray-300 leading-relaxed h-52 grid grid-cols-4 gap-4">
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
          <h3 className="text-lg font-semibold">{subject_name}</h3>
          <p className="text-sm text-white/60">{code}</p>
        </section>
        <section className="flex flex-row gap-4 font-bold">
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
          className={cn("text-sm gap-2 min-w-14", gradeColorClass)}
        >
          <span className={cn("h-2 w-2 rounded-full", dotColorClass)} />
          <p>{partial_grade}</p>
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
      className="flex items-center gap-2 text-[#888888] hover:text-[#007AFF]"
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </Link>
  );
};

export default SemesterTable;
export { FilterButtons };
