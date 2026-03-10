"use client";

import { type ElementType, type FormEvent,useState } from "react";
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

import MainLayout from "../main-layout";

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

const STATUS_UI: Record<
  SubjectStatus,
  { color: string; bg: string; icon: ElementType; label: string }
> = {
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

const inputClass =
  "h-11 bg-zinc-900/50 border-zinc-800 text-center font-medium text-lg rounded-xl focus-visible:ring-[#007AFF] focus-visible:bg-zinc-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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

function SemesterHeader({
  initialSemesters,
  activeSemesterId,
  setActiveSemesterId,
  activeSemesterTitle,
  isAddModalOpen,
  setIsAddModalOpen,
  handleAddSubject,
  addError,
  isAdding,
}: {
  initialSemesters: Semester[];
  activeSemesterId: string;
  setActiveSemesterId: (id: string) => void;
  activeSemesterTitle?: string;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (value: boolean) => void;
  handleAddSubject: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  addError: string | null;
  isAdding: boolean;
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 border-b border-[#1A1A1A] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-500">Período:</span>
          <select
            value={activeSemesterId}
            onChange={(e) => setActiveSemesterId(e.target.value)}
            className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-[#007AFF]"
          >
            {initialSemesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogTrigger asChild>
          <Button className="h-11 gap-2 rounded-xl bg-[#007AFF] px-6 font-bold text-white shadow-lg shadow-[#007AFF]/20 transition-all hover:bg-[#005bb5]">
            <LuPlus className="h-5 w-5" /> Nova Disciplina
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#0A0A0A] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Nova Disciplina em {activeSemesterTitle}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubject} className="space-y-4 pt-4">
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
      </Dialog>
    </header>
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
  onSave: (e: FormEvent<HTMLFormElement>, subjectId: string) => Promise<void>;
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
  const absencePercent = Math.min(
    (subject.currentAbsences / subject.maxAbsences) * 100,
    100,
  );
  const isDangerAbsence = absencePercent >= 80;

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

      <div className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Faltas Registradas
            </span>
            <div
              className={`text-sm font-bold ${isDangerAbsence ? "text-[#FF3B30]" : "text-zinc-300"}`}
            >
              {subject.currentAbsences}{" "}
              <span className="font-normal text-zinc-600">
                / {subject.maxAbsences} limite
              </span>
            </div>
          </div>
          <Input
            name="absences"
            type="number"
            min="0"
            defaultValue={subject.currentAbsences}
            className={`${inputClass} h-10 w-20 text-base`}
          />
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isDangerAbsence ? "bg-[#FF3B30]" : "bg-[#007AFF]"}`}
            style={{ width: `${absencePercent}%` }}
          />
        </div>
      </div>

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
            className={inputClass}
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
            className={inputClass}
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
            className={`${inputClass} border-[#007AFF]/20 bg-[#007AFF]/5`}
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
            className={`${inputClass} border-amber-500/20 bg-amber-500/5 focus-visible:ring-amber-500 disabled:border-zinc-900 disabled:opacity-30`}
          />
        </div>
      </div>

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
          disabled={loadingId === subject.id}
          className="h-10 gap-2 rounded-xl bg-zinc-100 px-5 font-bold text-black transition-colors hover:bg-white"
        >
          <LuSave className="h-4 w-4" />
          {loadingId === subject.id ? "..." : "Salvar"}
        </Button>
      </div>
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
  const [activeSemesterId, setActiveSemesterId] = useState<string>(
    initialSemesters[0]?.id || "",
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const activeSemester = initialSemesters.find(
    (s) => s.id === activeSemesterId,
  );

  async function handleSaveSubject(
    e: FormEvent<HTMLFormElement>,
    subjectId: string,
  ) {
    e.preventDefault();
    setLoadingId(subjectId);

    const formData = new FormData(e.currentTarget);
    const absences = Number(formData.get("absences"));

    const getGrade = (name: string) => {
      const val = formData.get(name) as string;
      return val ? parseFloat(val.replace(",", ".")) : null;
    };

    const grades = {
      ab1: getGrade("ab1"),
      ab2: getGrade("ab2"),
      reav: getGrade("reav"),
      finalExam: getGrade("finalExam"),
    };

    await Promise.all([
      updateSubjectAbsencesAction(subjectId, absences),
      updateSubjectGradesAction(subjectId, grades),
    ]);

    router.refresh();
    setLoadingId(null);
  }

  async function handleAddSubject(e: FormEvent<HTMLFormElement>) {
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
    const confirmDelete = window.confirm(
      "Tem certeza que deseja apagar esta disciplina? Todas as notas e faltas serão perdidas.",
    );
    if (!confirmDelete) return;

    setIsDeletingId(subjectId);
    await deleteSubjectAction(subjectId);
    setIsDeletingId(null);
    router.refresh();
  }

  if (initialSemesters.length === 0) {
    return <EmptySemestersState />;
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl">
        <SemesterHeader
          initialSemesters={initialSemesters}
          activeSemesterId={activeSemesterId}
          setActiveSemesterId={setActiveSemesterId}
          activeSemesterTitle={activeSemester?.title}
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          handleAddSubject={handleAddSubject}
          addError={addError}
          isAdding={isAdding}
        />

        {!activeSemester?.subjects.length ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-20 text-center">
            <p className="mb-2 text-zinc-500">
              Este semestre ainda não tem disciplinas.
            </p>
            <Button
              variant="link"
              onClick={() => setIsAddModalOpen(true)}
              className="text-[#007AFF]"
            >
              Criar a primeira
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activeSemester.subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                loadingId={loadingId}
                isDeletingId={isDeletingId}
                onSave={handleSaveSubject}
                onDelete={handleDeleteSubject}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
