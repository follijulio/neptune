"use client";

import { type ElementType, useState } from "react";
import {
  LuBookX,
  LuFolderOpen,
  LuGraduationCap,
  LuPlus,
  LuSave,
  LuTrash,
  LuPencil, // <-- O Lápis
} from "react-icons/lu";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createSubjectAction,
  deleteSubjectAction,
  updateSubjectAbsencesAction,
  updateSubjectGradesAction,
  updateSubjectBaseAction, // <-- Nossa nova action!
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

// Transformado num Modal inteligente (Criar/Editar)
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
      <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#0A0A0A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingSubject
              ? "Editar Disciplina"
              : `Nova Disciplina em ${activeSemesterTitle}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {error && (
            <p className="rounded-lg bg-[#FF3B30]/10 p-3 text-sm font-medium text-[#FF3B30]">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-400">
              Nome da Disciplina
            </label>
            <Input
              name="name"
              defaultValue={editingSubject?.name || ""}
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
              defaultValue={editingSubject?.workload || 60}
              min={15}
              step={15}
              className="[appearance:textfield] rounded-xl border-zinc-800 bg-zinc-900 text-white focus-visible:ring-[#007AFF] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <Button
            type="submit"
            disabled={isSaving}
            className="mt-2 h-11 w-full rounded-xl bg-[#007AFF] font-bold text-white hover:bg-[#005bb5]"
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
    <header className="mb-10 flex flex-row gap-6 border-b border-[#1A1A1A] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <SemesterSelector
          semesters={semesters}
          activeSemesterId={activeSemesterId}
          onChange={onSemesterChange}
        />
      </div>

      <Button
        onClick={onOpenCreate}
        className="h-11 gap-2 rounded-xl bg-[#007AFF] px-6 font-bold text-white shadow-lg shadow-[#007AFF]/20 transition-all hover:bg-[#005bb5]"
      >
        <LuPlus className="h-5 w-5" /> Nova Disciplina
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
  onSaveGrades,
  onDelete,
  onEdit, // <-- Prop nova para abrir o modal de edição
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
      onSubmit={(e) => onSaveGrades(e, subject.id)}
      className="group flex flex-col gap-6 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 shadow-2xl transition-colors hover:border-zinc-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3
            className="truncate pr-2 text-lg leading-tight font-bold text-white"
            title={subject.name}
          >
            {subject.name}
          </h3>
          <span className="text-xs font-medium text-zinc-500">
            {subject.workload}h • Máx {subject.maxAbsences} faltas
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`mr-2 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${UI.bg} ${UI.color} text-xs font-bold whitespace-nowrap`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {UI.label}
          </div>

          {/* BOTÃO DE EDITAR */}
          <button
            type="button"
            onClick={() => onEdit(subject)}
            className="rounded-md p-1.5 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#007AFF]/10 hover:text-[#007AFF]"
            title="Editar Disciplina"
          >
            <LuPencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(subject.id)}
            disabled={isDeletingId === subject.id}
            className="rounded-md p-1.5 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] disabled:opacity-50"
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

  // ESTADOS DO MODAL INTELIGENTE (CRIAR / EDITAR)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSavingBase, setIsSavingBase] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeSemester = initialSemesters.find(
    (s) => s.id === activeSemesterId,
  );

  if (initialSemesters.length === 0) {
    return <EmptySemestersState />;
  }

  // GUARDA NOTAS E FALTAS (O que já estava pronto)
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

  // FUNÇÃO ÚNICA PARA SALVAR DADOS BASE (CRIAR OU EDITAR)
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
      // MODO: EDITAR
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
      // MODO: CRIAR
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
    <section>
      <div className="mx-auto w-full max-w-7xl">
        <SemesterHeader
          semesters={initialSemesters}
          activeSemesterId={activeSemesterId}
          onSemesterChange={setActiveSemesterId}
          onOpenCreate={openCreateModal} // Passamos a função de abrir modal de criação
        />

        {!activeSemester?.subjects.length ? (
          <EmptySubjectsState onAdd={openCreateModal} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activeSemester.subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                loadingId={loadingId}
                isDeletingId={isDeletingId}
                onSaveGrades={handleSaveGrades}
                onDelete={handleDeleteSubject}
                onEdit={openEditModal} // Passamos a função de abrir modal de edição
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
