"use client";

import { type ElementType, useState } from "react";
import {
  LuBookX,
  LuFolderOpen,
  LuGraduationCap,
  LuPlus,
  LuSave,
  LuTrash,
} from "react-icons/lu";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createSubjectAction,
  deleteSubjectAction,
  updateSubjectAbsencesAction,
  updateSubjectGradesAction,
} from "@/src/app/actions/subject-actions";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import { Input } from "@/src/components/shadcn-ui/input";
import { calculateUFALStatus, type SubjectStatus } from "@/src/lib/ufal-math";

type Subject = {
  id: string;
  name: string;
  workload: number;
  maxAbsences: number;
  currentAbsences: number;
  ab1: number | null;
  ab2: number | null;
  reav: number | null;
  finalExam: number | null;
};

type Semester = { id: string; title: string; subjects: Subject[] };

type Grades = {
  ab1: number | null;
  ab2: number | null;
  reav: number | null;
  finalExam: number | null;
};

type StatusUIConfig = {
  color: string;
  bg: string;
  icon: ElementType;
  label: string;
};

const STATUS_UI: Record<SubjectStatus, StatusUIConfig> = {
  cursando: {
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 border-[#007AFF]/20",
    icon: LuGraduationCap,
    label: "Cursando",
  },
  aprovado: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
    label: "Aprovado",
  },
  reprovado_media: {
    color: "text-[#FF3B30]",
    bg: "bg-[#FF3B30]/10 border-[#FF3B30]/20",
    icon: LuBookX,
    label: "Reprovado por Média",
  },
  reprovado_falta: {
    color: "text-[#FF3B30]",
    bg: "bg-[#FF3B30]/10 border-[#FF3B30]/20",
    icon: AlertTriangle,
    label: "Reprovado por Falta",
  },
  final: {
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
    label: "Prova Final",
  },
};

const GRADE_INPUT_CLASS =
  "h-11 bg-zinc-900/50 border-zinc-800 text-center font-medium text-lg rounded-xl focus-visible:ring-[#007AFF] focus-visible:bg-zinc-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function parseGrade(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const parsed = parseFloat((value as string).replace(",", "."));
  return isNaN(parsed) ? null : parsed;
}

function extractGradesFromForm(formData: FormData): Grades {
  return {
    ab1: parseGrade(formData.get("ab1")),
    ab2: parseGrade(formData.get("ab2")),
    reav: parseGrade(formData.get("reav")),
    finalExam: parseGrade(formData.get("finalExam")),
  };
}

function EmptySemestersState() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-zinc-400">
      <LuFolderOpen className="mb-4 h-16 w-16 opacity-50" />
      <h2 className="text-xl font-bold text-white">
        Nenhum semestre encontrado
      </h2>
      <p>Faça o upload do seu histórico primeiro!</p>
    </div>
  );
}

function EmptySubjectsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-20 text-center">
      <p className="mb-2 text-zinc-500">
        Este semestre ainda não tem disciplinas.
      </p>
      <Button variant="link" onClick={onAdd} className="text-[#007AFF]">
        Criar a primeira
      </Button>
    </div>
  );
}

function SemesterSelector({
  semesters,
  activeSemesterId,
  onChange,
}: {
  semesters: Semester[];
  activeSemesterId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="text-sm font-medium text-zinc-500">Período:</span>
      <select
        value={activeSemesterId}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-[#007AFF]"
      >
        {semesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function AddSubjectForm({
  activeSemesterTitle,
  isAdding,
  addError,
  onSubmit,
}: {
  activeSemesterTitle?: string;
  isAdding: boolean;
  addError: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#0A0A0A] text-white sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">
          Nova Disciplina em {activeSemesterTitle}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4 pt-4">
        {addError && (
          <p className="rounded-lg bg-[#FF3B30]/10 p-3 text-sm font-medium text-[#FF3B30]">
            {addError}
          </p>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-400">
            Nome da Disciplina
          </label>
          <Input
            name="name"
            placeholder="Ex: Algoritmos"
            className="rounded-xl border-zinc-800 bg-zinc-900 text-white focus-visible:ring-[#007AFF]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-400">
            Carga Horária Total
          </label>
          <Input
            name="workload"
            type="number"
            defaultValue={60}
            min={15}
            step={15}
            className="[appearance:textfield] rounded-xl border-zinc-800 bg-zinc-900 text-white focus-visible:ring-[#007AFF] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <Button
          type="submit"
          disabled={isAdding}
          className="mt-2 h-11 w-full rounded-xl bg-[#007AFF] font-bold text-white hover:bg-[#005bb5]"
        >
          {isAdding ? "A salvar..." : "Adicionar"}
        </Button>
      </form>
    </DialogContent>
  );
}

function SemesterHeader({
  semesters,
  activeSemesterId,
  activeSemesterTitle,
  isAddModalOpen,
  isAdding,
  addError,
  onSemesterChange,
  onAddModalChange,
  onAddSubject,
}: {
  semesters: Semester[];
  activeSemesterId: string;
  activeSemesterTitle?: string;
  isAddModalOpen: boolean;
  isAdding: boolean;
  addError: string | null;
  onSemesterChange: (id: string) => void;
  onAddModalChange: (value: boolean) => void;
  onAddSubject: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 border-b border-[#1A1A1A] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <SemesterSelector
          semesters={semesters}
          activeSemesterId={activeSemesterId}
          onChange={onSemesterChange}
        />
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={onAddModalChange}>
        <DialogTrigger asChild>
          <Button className="h-11 gap-2 rounded-xl bg-[#007AFF] px-6 font-bold text-white shadow-lg shadow-[#007AFF]/20 transition-all hover:bg-[#005bb5]">
            <LuPlus className="h-5 w-5" /> Nova Disciplina
          </Button>
        </DialogTrigger>

        <AddSubjectForm
          activeSemesterTitle={activeSemesterTitle}
          isAdding={isAdding}
          addError={addError}
          onSubmit={onAddSubject}
        />
      </Dialog>
    </header>
  );
}

function AbsenceTracker({
  currentAbsences,
  maxAbsences,
}: {
  currentAbsences: number;
  maxAbsences: number;
}) {
  const absencePercent = Math.min((currentAbsences / maxAbsences) * 100, 100);
  const isDanger = absencePercent >= 80;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Faltas Registradas
          </span>
          <div
            className={`text-sm font-bold ${isDanger ? "text-[#FF3B30]" : "text-zinc-300"}`}
          >
            {currentAbsences}{" "}
            <span className="font-normal text-zinc-600">
              / {maxAbsences} limite
            </span>
          </div>
        </div>
        <Input
          name="absences"
          type="number"
          min="0"
          defaultValue={currentAbsences}
          className={`${GRADE_INPUT_CLASS} h-10 w-20 text-base`}
        />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isDanger ? "bg-[#FF3B30]" : "bg-[#007AFF]"}`}
          style={{ width: `${absencePercent}%` }}
        />
      </div>
    </div>
  );
}

function GradeInputs({
  subject,
  status,
}: {
  subject: Subject;
  status: SubjectStatus;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="space-y-2 text-center">
        <label className="text-xs font-bold tracking-wide text-zinc-500">
          AB1
        </label>
        <Input
          name="ab1"
          type="number"
          step="0.1"
          min="0"
          max="10"
          defaultValue={subject.ab1 ?? ""}
          className={GRADE_INPUT_CLASS}
        />
      </div>
      <div className="space-y-2 text-center">
        <label className="text-xs font-bold tracking-wide text-zinc-500">
          AB2
        </label>
        <Input
          name="ab2"
          type="number"
          step="0.1"
          min="0"
          max="10"
          defaultValue={subject.ab2 ?? ""}
          className={GRADE_INPUT_CLASS}
        />
      </div>
      <div className="space-y-2 text-center">
        <label className="text-xs font-bold tracking-wide text-[#007AFF]">
          REAV
        </label>
        <Input
          name="reav"
          type="number"
          step="0.1"
          min="0"
          max="10"
          defaultValue={subject.reav ?? ""}
          className={`${GRADE_INPUT_CLASS} border-[#007AFF]/20 bg-[#007AFF]/5`}
        />
      </div>
      <div className="space-y-2 text-center">
        <label className="text-xs font-bold tracking-wide text-amber-500">
          FINAL
        </label>
        <Input
          name="finalExam"
          type="number"
          step="0.1"
          min="0"
          max="10"
          defaultValue={subject.finalExam ?? ""}
          disabled={status !== "final"}
          className={`${GRADE_INPUT_CLASS} border-amber-500/20 bg-amber-500/5 focus-visible:ring-amber-500 disabled:border-zinc-900 disabled:opacity-30`}
        />
      </div>
    </div>
  );
}

function SubjectCardFooter({
  status,
  currentAverage,
  neededForFinal,
  isSaving,
}: {
  subjectId: string;
  status: SubjectStatus;
  currentAverage: number;
  neededForFinal: number;
  isSaving: boolean;
}) {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-[#1A1A1A] pt-4">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
          Média
        </span>
        <span
          className={`text-2xl font-bold ${currentAverage >= 7 ? "text-emerald-500" : "text-white"}`}
        >
          {currentAverage.toFixed(1)}
        </span>
      </div>

      {status === "final" && (
        <div className="flex flex-col rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-center">
          <span className="text-[10px] font-bold text-amber-500 uppercase">
            Precisa
          </span>
          <span className="text-lg font-black text-amber-500">
            {neededForFinal.toFixed(1)}
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSaving}
        className="h-10 gap-2 rounded-xl bg-zinc-100 px-5 font-bold text-black transition-colors hover:bg-white"
      >
        <LuSave className="h-4 w-4" />
        {isSaving ? "..." : "Salvar"}
      </Button>
    </div>
  );
}

function SubjectCard({
  subject,
  loadingId,
  isDeletingId,
  onSave,
  onDelete,
}: {
  subject: Subject;
  loadingId: string | null;
  isDeletingId: string | null;
  onSave: (
    e: React.FormEvent<HTMLFormElement>,
    subjectId: string,
  ) => Promise<void>;
  onDelete: (subjectId: string) => Promise<void>;
}) {
  const { status, currentAverage, neededForFinal } = calculateUFALStatus(
    subject.ab1,
    subject.ab2,
    subject.reav,
    subject.finalExam,
    subject.currentAbsences,
    subject.maxAbsences,
  );

  const UI = STATUS_UI[status];
  const StatusIcon = UI.icon;

  return (
    <form
      onSubmit={(e) => onSave(e, subject.id)}
      className="flex flex-col gap-6 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 shadow-2xl transition-colors hover:border-zinc-800"
    >
      <div className="flex items-start justify-between">
        <h3
          className="truncate pr-2 text-lg leading-tight font-bold text-white"
          title={subject.name}
        >
          {subject.name}
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${UI.bg} ${UI.color} text-xs font-bold whitespace-nowrap`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {UI.label}
          </div>
          <button
            type="button"
            onClick={() => onDelete(subject.id)}
            disabled={isDeletingId === subject.id}
            className="rounded-md p-1.5 text-zinc-600 transition-all hover:bg-[#FF3B30]/10 hover:text-[#FF3B30]"
            title="Apagar Disciplina"
          >
            <LuTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AbsenceTracker
        currentAbsences={subject.currentAbsences}
        maxAbsences={subject.maxAbsences}
      />

      <GradeInputs subject={subject} status={status} />

      <SubjectCardFooter
        subjectId={subject.id}
        status={status}
        currentAverage={currentAverage}
        neededForFinal={neededForFinal}
        isSaving={loadingId === subject.id}
      />
    </form>
  );
}

function SubjectGrid({
  subjects,
  loadingId,
  isDeletingId,
  onSave,
  onDelete,
  onAddFirst,
}: {
  subjects: Subject[];
  loadingId: string | null;
  isDeletingId: string | null;
  onSave: (
    e: React.FormEvent<HTMLFormElement>,
    subjectId: string,
  ) => Promise<void>;
  onDelete: (subjectId: string) => Promise<void>;
  onAddFirst: () => void;
}) {
  if (!subjects.length) {
    return <EmptySubjectsState onAdd={onAddFirst} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          loadingId={loadingId}
          isDeletingId={isDeletingId}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default function SemesterClient({
  initialSemesters,
}: {
  initialSemesters: Semester[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [activeSemesterId, setActiveSemesterId] = useState<string>(
    initialSemesters[0]?.id ?? "",
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const activeSemester = initialSemesters.find(
    (s) => s.id === activeSemesterId,
  );

  if (initialSemesters.length === 0) {
    return <EmptySemestersState />;
  }

  async function handleSaveSubject(
    e: React.FormEvent<HTMLFormElement>,
    subjectId: string,
  ) {
    e.preventDefault();
    setLoadingId(subjectId);

    const formData = new FormData(e.currentTarget);
    const absences = Number(formData.get("absences"));
    const grades = extractGradesFromForm(formData);

    await Promise.all([
      updateSubjectAbsencesAction(subjectId, absences),
      updateSubjectGradesAction(subjectId, grades),
    ]);

    router.refresh();
    setLoadingId(null);
  }

  async function handleAddSubject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeSemester) return;

    setIsAdding(true);
    setAddError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const workload = Number(formData.get("workload"));

    if (!name || !workload) {
      setAddError("Preencha todos os campos.");
      setIsAdding(false);
      return;
    }

    const result = await createSubjectAction({
      name,
      workload,
      semesterId: activeSemester.id,
    });

    if (result.error) {
      setAddError(result.error);
    } else {
      setIsAddModalOpen(false);
      router.refresh();
    }

    setIsAdding(false);
  }

  async function handleDeleteSubject(subjectId: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja apagar esta disciplina? Todas as notas e faltas serão perdidas.",
    );
    if (!confirmed) return;

    setIsDeletingId(subjectId);
    await deleteSubjectAction(subjectId);
    setIsDeletingId(null);
    router.refresh();
  }

  return (
    <section>
      <div className="mx-auto w-full max-w-7xl">
        <SemesterHeader
          semesters={initialSemesters}
          activeSemesterId={activeSemesterId}
          activeSemesterTitle={activeSemester?.title}
          isAddModalOpen={isAddModalOpen}
          isAdding={isAdding}
          addError={addError}
          onSemesterChange={setActiveSemesterId}
          onAddModalChange={setIsAddModalOpen}
          onAddSubject={handleAddSubject}
        />

        <SubjectGrid
          subjects={activeSemester?.subjects ?? []}
          loadingId={loadingId}
          isDeletingId={isDeletingId}
          onSave={handleSaveSubject}
          onDelete={handleDeleteSubject}
          onAddFirst={() => setIsAddModalOpen(true)}
        />
      </div>
    </section>
  );
}
