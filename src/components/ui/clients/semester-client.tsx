"use client";

import { type ElementType, useMemo, useState } from "react";
import {
  LuBookX,
  LuFolderOpen,
  LuGraduationCap,
  LuPencil,
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
  updateSubjectBaseAction,
  updateSubjectGradesAction,
} from "@/src/app/actions/subject-actions";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  "h-10 sm:h-11 bg-zinc-900/50 border-zinc-800 text-center font-medium text-base sm:text-lg rounded-xl focus-visible:ring-[#007AFF] focus-visible:bg-zinc-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-zinc-400 sm:min-h-[80vh]">
      <LuFolderOpen className="mb-4 h-12 w-12 opacity-50 sm:h-16 sm:w-16" />
      <h2 className="text-center text-lg font-bold text-white sm:text-xl">
        Nenhum semestre encontrado
      </h2>
      <p className="mt-2 text-center text-sm sm:text-base">
        Faça o upload do seu histórico primeiro!
      </p>
    </div>
  );
}

function EmptySubjectsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mx-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 py-12 text-center sm:mx-0 sm:py-20">
      <p className="mb-2 text-sm text-zinc-500 sm:text-base">
        Este semestre ainda não tem disciplinas.
      </p>
      <Button
        variant="link"
        onClick={onAdd}
        className="text-sm text-[#007AFF] sm:text-base"
      >
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
    <div className="mt-2 flex items-center gap-3 sm:gap-4">
      <span className="text-sm font-semibold text-white sm:text-xl">
        Período:
      </span>
      <select
        title="select-semester"
        value={activeSemesterId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-xl border border-[#007AFF] bg-[#071033] px-3 py-2 text-sm font-semibold text-white shadow-sm outline-none focus:ring-2 focus:ring-[#007AFF]/60 sm:w-auto sm:px-4 sm:py-2.5 sm:text-base"
        aria-label="Selecionar período"
      >
        {semesters.map((s) => (
          <option key={s.id} value={s.id} className="bg-[#071033] text-white">
            {s.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubjectFormModal({
  isOpen,
  onOpenChange,
  activeSemesterTitle,
  isSaving,
  error,
  editingSubject,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeSemesterTitle?: string;
  isSaving: boolean;
  error: string | null;
  editingSubject: Subject | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-100 rounded-xl border-[#1A1A1A] bg-[#0A0A0A] p-4 text-white sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold sm:text-xl">
            {editingSubject
              ? "Editar Disciplina"
              : `Nova Disciplina em ${activeSemesterTitle}`}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-3 pt-2 sm:space-y-4 sm:pt-4"
        >
          {error && (
            <p className="rounded-lg bg-[#FF3B30]/10 p-2 text-xs font-medium text-[#FF3B30] sm:p-3 sm:text-sm">
              {error}
            </p>
          )}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold text-zinc-400 sm:text-sm">
              Nome da Disciplina
            </label>
            <Input
              name="name"
              defaultValue={editingSubject?.name || ""}
              placeholder="Ex: Algoritmos"
              className="h-10 rounded-xl border-zinc-800 bg-zinc-900 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold text-zinc-400 sm:text-sm">
              Carga Horária Total
            </label>
            <Input
              name="workload"
              type="number"
              defaultValue={editingSubject?.workload || 60}
              min={15}
              step={15}
              className="h-10 [appearance:textfield] rounded-xl border-zinc-800 bg-zinc-900 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <Button
            type="submit"
            disabled={isSaving}
            className="mt-2 h-10 w-full rounded-xl bg-[#007AFF] text-sm font-bold text-white hover:bg-[#005bb5] sm:h-11 sm:text-base"
          >
            {isSaving
              ? "A salvar..."
              : editingSubject
                ? "Salvar Alterações"
                : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SemesterHeader({
  semesters,
  activeSemesterId,
  onSemesterChange,
  onOpenCreate,
}: {
  semesters: Semester[];
  activeSemesterId: string;
  onSemesterChange: (id: string) => void;
  onOpenCreate: () => void;
}) {
  return (
    <header className="mx-4 mb-6 flex flex-col gap-4 border-b border-[#1A1A1A] pb-4 sm:mx-0 sm:mb-10 sm:pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex w-full flex-col gap-2 md:w-auto">
        <SemesterSelector
          semesters={semesters}
          activeSemesterId={activeSemesterId}
          onChange={onSemesterChange}
        />
      </div>

      <Button
        onClick={onOpenCreate}
        className="h-10 w-full gap-2 rounded-xl bg-[#007AFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007AFF]/20 transition-all hover:bg-[#005bb5] sm:h-11 sm:px-6 sm:text-base md:w-auto"
      >
        <LuPlus className="h-4 w-4 sm:h-5 sm:w-5" /> Nova Disciplina
      </Button>
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
  const absencePercent = useMemo(
    () => Math.min((currentAbsences / maxAbsences) * 100, 100),
    [currentAbsences, maxAbsences],
  );
  const isDanger = absencePercent >= 80;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3 sm:space-y-3 sm:p-4">
      <div className="flex items-end justify-between">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase sm:text-xs">
            Faltas Registradas
          </span>
          <div
            className={`text-xs font-bold sm:text-sm ${isDanger ? "text-[#FF3B30]" : "text-zinc-300"}`}
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
          className={`${GRADE_INPUT_CLASS} h-8 w-16 text-sm sm:h-10 sm:w-20 sm:text-base`}
        />
      </div>
      <div className="h-1 w-full overflow-hidden rounded-2xl bg-zinc-900 sm:h-1.5">
        <div
          className={`h-full rounded-2xl transition-all duration-500 ${isDanger ? "bg-[#FF3B30]" : "bg-[#007AFF]"}`}
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
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      <div className="space-y-1 text-center sm:space-y-2">
        <label className="text-[10px] font-bold tracking-wide text-zinc-500 sm:text-xs">
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
      <div className="space-y-1 text-center sm:space-y-2">
        <label className="text-[10px] font-bold tracking-wide text-zinc-500 sm:text-xs">
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
      <div className="space-y-1 text-center sm:space-y-2">
        <label className="text-[10px] font-bold tracking-wide text-[#007AFF] sm:text-xs">
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
      <div className="space-y-1 text-center sm:space-y-2">
        <label className="text-[10px] font-bold tracking-wide text-amber-500 sm:text-xs">
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
  status: SubjectStatus;
  currentAverage: number;
  neededForFinal: number;
  isSaving: boolean;
}) {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-[#1A1A1A] pt-3 sm:pt-4">
      <div className="flex flex-col">
        <span className="text-[8px] font-bold tracking-wider text-zinc-500 uppercase sm:text-[10px]">
          Média
        </span>
        <span
          className={`text-xl font-bold sm:text-2xl ${currentAverage >= 7 ? "text-emerald-500" : "text-white"}`}
        >
          {currentAverage.toFixed(1)}
        </span>
      </div>

      {status === "final" && (
        <div className="flex flex-col rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-center sm:px-3 sm:py-1">
          <span className="text-[8px] font-bold text-amber-500 uppercase sm:text-[10px]">
            Precisa
          </span>
          <span className="text-base font-black text-amber-500 sm:text-lg">
            {neededForFinal.toFixed(1)}
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSaving}
        className="h-8 gap-1 rounded-lg bg-zinc-100 px-3 text-xs font-bold text-black transition-colors hover:bg-white sm:h-10 sm:gap-2 sm:rounded-xl sm:px-5 sm:text-sm"
      >
        <LuSave className="h-3 w-3 sm:h-4 sm:w-4" />
        {isSaving ? "..." : "Salvar"}
      </Button>
    </div>
  );
}

function SubjectCard({
  subject,
  loadingId,
  isDeletingId,
  onSaveGrades,
  onDelete,
  onEdit,
}: {
  subject: Subject;
  loadingId: string | null;
  isDeletingId: string | null;
  onSaveGrades: (
    e: React.FormEvent<HTMLFormElement>,
    subjectId: string,
  ) => Promise<void>;
  onDelete: (subjectId: string) => Promise<void>;
  onEdit: (subject: Subject) => void;
}) {
  const { status, currentAverage, neededForFinal } = useMemo(
    () =>
      calculateUFALStatus(
        subject.ab1,
        subject.ab2,
        subject.reav,
        subject.finalExam,
        subject.currentAbsences,
        subject.maxAbsences,
      ),
    [subject],
  );

  const UI = STATUS_UI[status];
  const StatusIcon = UI.icon;

  return (
    <form
      onSubmit={(e) => onSaveGrades(e, subject.id)}
      className="group flex flex-col gap-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 shadow-2xl transition-colors hover:border-zinc-800 sm:gap-6 sm:rounded-xl sm:p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col pr-2">
          <h3
            className="line-clamp-2 text-base leading-tight font-bold text-white sm:text-lg"
            title={subject.name}
          >
            {subject.name}
          </h3>
          <span className="mt-0.5 text-[10px] font-medium text-zinc-500 sm:mt-1 sm:text-xs">
            {subject.workload}h • Máx {subject.maxAbsences} faltas
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div
            className={`mr-1 flex items-center gap-1 rounded-lg border px-2 py-1 sm:mr-2 sm:gap-1.5 sm:px-3 sm:py-1.5 ${UI.bg} ${UI.color} text-[10px] font-bold whitespace-nowrap sm:text-xs`}
          >
            <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{UI.label}</span>
          </div>

          <button
            type="button"
            onClick={() => onEdit(subject)}
            className="rounded-md p-1.5 text-zinc-600 transition-all hover:bg-[#007AFF]/10 hover:text-[#007AFF] sm:opacity-0 sm:group-hover:opacity-100"
            title="Editar Disciplina"
          >
            <LuPencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(subject.id)}
            disabled={isDeletingId === subject.id}
            className="rounded-md p-1.5 text-zinc-600 transition-all hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
            title="Apagar Disciplina"
          >
            <LuTrash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      <AbsenceTracker
        currentAbsences={subject.currentAbsences}
        maxAbsences={subject.maxAbsences}
      />
      <GradeInputs subject={subject} status={status} />
      <SubjectCardFooter
        status={status}
        currentAverage={currentAverage}
        neededForFinal={neededForFinal}
        isSaving={loadingId === subject.id}
      />
    </form>
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSavingBase, setIsSavingBase] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeSemester = useMemo(
    () => initialSemesters.find((s) => s.id === activeSemesterId),
    [initialSemesters, activeSemesterId],
  );

  if (initialSemesters.length === 0) {
    return <EmptySemestersState />;
  }

  async function handleSaveGrades(
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

  function openCreateModal() {
    setEditingSubject(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(subject: Subject) {
    setEditingSubject(subject);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSaveBaseSubject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeSemester) return;

    setIsSavingBase(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const workload = Number(formData.get("workload"));

    if (!name || !workload) {
      setFormError("Preencha todos os campos.");
      setIsSavingBase(false);
      return;
    }

    if (editingSubject) {
      const result = await updateSubjectBaseAction(editingSubject.id, {
        name,
        workload,
      });
      if (result.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    } else {
      const result = await createSubjectAction({
        name,
        workload,
        semesterId: activeSemester.id,
      });
      if (result.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    }
    setIsSavingBase(false);
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
    <section className="pb-8">
      <div className="mx-auto w-full">
        <SemesterHeader
          semesters={initialSemesters}
          activeSemesterId={activeSemesterId}
          onSemesterChange={setActiveSemesterId}
          onOpenCreate={openCreateModal}
        />

        {!activeSemester?.subjects.length ? (
          <EmptySubjectsState onAdd={openCreateModal} />
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4 sm:gap-6 sm:px-0 md:grid-cols-2">
            {activeSemester.subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                loadingId={loadingId}
                isDeletingId={isDeletingId}
                onSaveGrades={handleSaveGrades}
                onDelete={handleDeleteSubject}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}

        <SubjectFormModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          activeSemesterTitle={activeSemester?.title}
          isSaving={isSavingBase}
          error={formError}
          editingSubject={editingSubject}
          onSubmit={handleSaveBaseSubject}
        />
      </div>
    </section>
  );
}
