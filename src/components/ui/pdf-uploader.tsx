"use client";

import { useMemo, useState } from "react";
import { LuCheck, LuCircleAlert, LuFileText, LuUpload } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { Alert } from "../shadcn-ui/alert";

import type { ParsedSubject } from "@/src/app/actions/pdf-actions";
import {
  parseAcademicHistoryAction,
  saveExtractedSubjectsAction,
} from "@/src/app/actions/pdf-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/shadcn-ui/card";

interface UploadState {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  results: ParsedSubject[] | null;
  isSaving: boolean;
  savedSuccess: boolean;
}

function FileInputZone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileSizeMB = useMemo(() => {
    if (!file) return 0;
    return (file.size / 1024 / 1024).toFixed(2);
  }, [file]);

  return (
    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1A1A1A] bg-[#000000]/50 p-6 text-center transition-colors hover:border-[#007AFF] sm:p-8">
      <input
        type="file"
        accept="application/pdf"
        onChange={onChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      {file ? (
        <>
          <LuCheck className="mb-3 text-3xl text-[#00FF88] sm:mb-4 sm:text-4xl" />
          <p className="text-sm font-medium text-[#E0E0E0] sm:text-base">
            {file.name}
          </p>
          <p className="mt-1 text-xs text-[#888888] sm:text-sm">
            {fileSizeMB} MB
          </p>
        </>
      ) : (
        <>
          <LuUpload className="mb-3 text-4xl text-[#888888] transition-colors group-hover:text-[#007AFF] sm:mb-4 sm:text-5xl" />
          <p className="text-sm font-medium text-[#E0E0E0] sm:text-base">
            Clique ou arraste seu PDF aqui
          </p>
          <p className="mt-1 text-xs text-[#888888] sm:text-sm">
            Apenas arquivos .pdf
          </p>
        </>
      )}
    </div>
  );
}

function ErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#FF3B30]/20 bg-[#FF3B30]/10 p-3 text-[#FF3B30] sm:p-4">
      <LuCircleAlert className="shrink-0 text-lg sm:text-xl" />
      <p className="text-xs sm:text-sm">{error}</p>
    </div>
  );
}

function UploadButton({
  isLoading,
  hasFile,
}: {
  isLoading: boolean;
  hasFile: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={!hasFile || isLoading}
      className="h-10 w-full rounded-lg bg-[#007AFF] text-base font-bold text-white transition-all hover:bg-[#007AFF]/80 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-lg"
    >
      {isLoading ? "Analisando o documento..." : "Analisar Documento"}
    </button>
  );
}

function LoadingAlert() {
  return (
    <Alert className="mt-2 flex w-full rounded-xl border-[#1A1A1A] bg-[#0B0B0B]/80 px-3 py-3 backdrop-blur-sm sm:px-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#007AFF] sm:h-2.5 sm:w-2.5" />
        <div className="w-full">
          <p className="text-xs font-medium text-[#E0E0E0] sm:text-sm">
            Analisando seu histórico...
          </p>
          <p className="mt-1 text-[10px] text-[#888888] sm:text-xs">
            Isso pode levar alguns segundos, dependendo do tamanho do PDF.
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#007AFF]" />
          </div>
        </div>
      </div>
    </Alert>
  );
}

function SubjectItem({ subject }: { subject: ParsedSubject }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#1A1A1A] bg-[#000000] p-2.5 sm:p-3">
      <div className="flex flex-col pr-2">
        <span className="line-clamp-1 text-xs font-medium text-[#E0E0E0] sm:text-sm">
          {subject.name}
        </span>
        <span className="mt-0.5 text-[10px] text-[#888888] sm:mt-1 sm:text-xs">
          Status: {subject.status}
        </span>
      </div>
      {subject.grade && (
        <div className="shrink-0 rounded border border-[#1A1A1A] bg-[#121212] px-2 py-0.5 text-xs font-bold text-[#007AFF] sm:px-3 sm:py-1 sm:text-sm">
          {subject.grade}
        </div>
      )}
    </div>
  );
}

function SubjectsList({
  results,
  isSaving,
  onSave,
}: {
  results: ParsedSubject[];
  isSaving: boolean;
  onSave: () => void;
}) {
  const subjectStats = useMemo(() => {
    const passed = results.filter(
      (r) =>
        r.status.toLowerCase().includes("aprov") ||
        r.status.toLowerCase() === "ap",
    ).length;
    return {
      total: results.length,
      passed,
    };
  }, [results]);

  const renderedSubjects = useMemo(() => {
    return results.map((subject, index) => (
      <SubjectItem key={index} subject={subject} />
    ));
  }, [results]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mt-6 duration-500 sm:mt-8">
      <div className="mb-3 flex flex-col justify-between gap-1 sm:mb-4 sm:flex-row sm:items-center">
        <h3 className="text-sm font-bold text-[#E0E0E0] sm:text-base">
          Disciplinas Encontradas
        </h3>
        <div className="flex gap-2 text-[10px] font-medium sm:text-xs">
          <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">
            Total: {subjectStats.total}
          </span>
          {subjectStats.passed > 0 && (
            <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-500">
              {subjectStats.passed} Aprovadas
            </span>
          )}
        </div>
      </div>

      <div className="custom-scrollbar mb-4 max-h-56 space-y-2 overflow-y-auto pr-2 sm:mb-6 sm:max-h-64">
        {renderedSubjects}
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="h-10 w-full rounded-lg bg-[#00FF88] text-base font-bold text-[#000000] transition-all hover:bg-[#00FF88]/80 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-lg"
      >
        {isSaving
          ? "Salvando na sua conta..."
          : "Confirmar e Salvar no Meu Perfil"}
      </button>
    </div>
  );
}

function SuccessState({ onUpdate }: { onUpdate: () => void }) {
  return (
    <div className="animate-in zoom-in mt-6 rounded-xl border border-[#00FF88]/30 bg-[#00FF88]/10 p-5 text-center duration-300 sm:mt-8 sm:p-6">
      <LuCheck className="mx-auto mb-3 text-4xl text-[#00FF88] sm:mb-4 sm:text-5xl" />
      <h3 className="mb-1 text-lg font-bold text-[#E0E0E0] sm:mb-2 sm:text-xl">
        Histórico Importado!
      </h3>
      <p className="text-xs text-[#888888] sm:text-sm">
        Suas disciplinas e notas já estão no seu dashboard.
      </p>
      <button
        onClick={onUpdate}
        className="mt-4 rounded-lg bg-[#00FF88]/20 px-4 py-2 text-xs font-bold text-[#00FF88] transition-colors hover:bg-[#00FF88]/30 sm:mt-5 sm:text-sm"
      >
        Atualizar Dashboard
      </button>
    </div>
  );
}

export default function PdfUploader() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({
    file: null,
    isLoading: false,
    error: null,
    results: null,
    isSaving: false,
    savedSuccess: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setState((prev) => ({
        ...prev,
        file: e.target.files![0],
        error: null,
        results: null,
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.file) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const formData = new FormData();
    formData.append("pdfFile", state.file);

    const response = await parseAcademicHistoryAction(formData);

    if (response.error) {
      setState((prev) => ({
        ...prev,
        error: response.error ?? null,
        isLoading: false,
      }));
    } else if (response.subjects) {
      setState((prev) => ({
        ...prev,
        results: response.subjects,
        isLoading: false,
      }));
    }
  };

  const handleSaveToDatabase = async () => {
    if (!state.results) return;

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    const response = await saveExtractedSubjectsAction(state.results);

    if (response.error) {
      setState((prev) => ({
        ...prev,
        error: response.error ?? null,
        isSaving: false,
      }));
    } else if (response.success) {
      setState((prev) => ({
        ...prev,
        savedSuccess: true,
        results: null,
        isSaving: false,
      }));

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <Card className="mx-auto mt-6 w-full max-w-2xl border-[#1A1A1A] bg-[#121212] text-[#E0E0E0] sm:mt-10">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <LuFileText className="shrink-0 text-[#007AFF]" />
          <span className="truncate">Importar Histórico</span>
        </CardTitle>
        <CardDescription className="text-xs text-[#888888] sm:text-sm">
          Envie seu histórico em PDF. Nossa IA vai ler o documento e extrair
          todas as suas disciplinas e notas automaticamente.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
          <FileInputZone file={state.file} onChange={handleFileChange} />
          <ErrorAlert error={state.error} />
          <UploadButton isLoading={state.isLoading} hasFile={!!state.file} />
          {state.isLoading && <LoadingAlert />}
        </form>

        {state.results && !state.savedSuccess && (
          <SubjectsList
            results={state.results}
            isSaving={state.isSaving}
            onSave={handleSaveToDatabase}
          />
        )}

        {state.savedSuccess && <SuccessState onUpdate={handleUpdate} />}
      </CardContent>
    </Card>
  );
}
