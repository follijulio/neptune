"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../shadcn-ui/accordion";
import { Button } from "../../shadcn-ui/button";
import { Card } from "../../shadcn-ui/card";
import { useFilterParam } from "@/src/hooks/useFilterParam";

interface Subject {
  subject_name: string;
  code: string;
  status: string;
  partial_grade: number;
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

const SemesterTable: React.FC<{ data: Semester[] }> = ({ data }) => {
  const { value: activeFilter, setParam: setFilter } = useFilterParam(
    "filterCurriculum",
    {
      defaultValue: DEFAULT_FILTER,
      toggle: true,
    },
  );

  return (
    <Card className="h-96 w-full bg-black text-white p-2 border-0">
      <h2 className="text-2xl font-semibold mb-4">Grade Curricular</h2>
      <section>
        <FilterButtons
          filters={CURRICULUM_FILTERS}
          activeFilter={activeFilter || DEFAULT_FILTER}
          onFilterChange={setFilter}
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
  const getButtonStyles = (isActive: boolean) =>
    `transition-colors duration-200 ${
      isActive
        ? "bg-white text-black hover:bg-gray-200"
        : "bg-transparent text-white border border-gray-600 hover:bg-gray-800"
    }`;

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={getButtonStyles(activeFilter === filter.id)}
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
            <AccordionTrigger
              status={semester.semester}
              className="text-xl font-semibold py-4"
            >
              <span className="flex items-center gap-2">
                {semester.semester}
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-white/15 pt-4 pb-2 text-gray-300 leading-relaxed h-96">
              {semester.data.map((subject) => (
                <SubjectCard
                  key={subject.code}
                  name={subject.subject_name}
                  code={subject.code}
                  status={subject.status}
                  grade={subject.partial_grade.toString()}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Card>
      ))}
    </Accordion>
  );
};

interface SubjectCardProps {
  name: string;
  code: string;
  status: string;
  grade: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  code,
  status,
  grade,
}) => {
  return (
    <Card className="bg-gray-800 text-white p-4 border-0">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-400">{code}</p>
      <p className="text-sm">Status: {status}</p>
      <p className="text-sm">Grade: {grade}</p>
    </Card>
  );
};

export default SemesterTable;
export { FilterButtons };
