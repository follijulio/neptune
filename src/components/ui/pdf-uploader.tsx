"use client";

import { useState } from "react";
import { LuCheck, LuCircleAlert, LuFileText, LuUpload } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { Alert } from "../shadcn-ui/alert";

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

interface ParsedSubject {
  name: string;
  grade?: string;
  status: string;
}

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
  return (
    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1A1A1A] bg-[#000000]/50 p-8 text-center transition-colors hover:border-[#007AFF]">
      <input
        type="file"
        accept="application/pdf"
        onChange={onChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      {file ? (
        <>
          <LuCheck className="mb-4 text-4xl text-[#00FF88]" />
          <p className="font-medium text-[#E0E0E0]">{file.name}</p>
          <p className="mt-1 text-sm text-[#888888]">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </>
      ) : (
        <>
          <LuUpload className="mb-4 text-5xl text-[#888888] transition-colors group-hover:text-[#007AFF]" />
          <p className="font-medium text-[#E0E0E0]">
            Clique ou arraste seu PDF aqui
          </p>
          <p className="mt-1 text-sm text-[#888888]">Apenas arquivos .pdf</p>
        </>
      )}
    </div>
  );
}

function ErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#FF3B30]/20 bg-[#FF3B30]/10 p-4 text-[#FF3B30]">
      <LuCircleAlert className="shrink-0 text-xl" />
      <p className="text-sm">{error}</p>
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
      className="h-12 w-full rounded-lg bg-[#007AFF] text-lg font-bold text-white transition-all hover:bg-[#007AFF]/80 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "Analisando o documento..." : "Analisar Documento"}
    </button>
  );
}

function LoadingAlert() {
  return (
    <Alert className="mt-2 flex w-full rounded-xl border-[#1A1A1A] bg-[#0B0B0B]/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#007AFF]" />
        <div className="w-full">
          <p className="text-sm font-medium text-[#E0E0E0]">
            Analisando seu histórico...
          </p>
          <p className="mt-1 text-xs text-[#888888]">
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
    <div className="flex items-center justify-between rounded-lg border border-[#1A1A1A] bg-[#000000] p-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[#E0E0E0]">
          {subject.name}
        </span>
        <span className="mt-1 text-xs text-[#888888]">
          Status: {subject.status}
        </span>
      </div>
      {subject.grade && (
        <div className="rounded border border-[#1A1A1A] bg-[#121212] px-3 py-1 font-bold text-[#007AFF]">
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
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 duration-500">
      <h3 className="mb-4 flex items-center justify-between font-bold text-[#E0E0E0]">
        <span>Disciplinas Encontradas ({results.length})</span>
      </h3>

      <div className="custom-scrollbar mb-6 max-h-64 space-y-2 overflow-y-auto pr-2">
        {results.map((subject, index) => (
          <SubjectItem key={index} subject={subject} />
        ))}
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="h-12 w-full rounded-lg bg-[#00FF88] text-lg font-bold text-[#000000] transition-all hover:bg-[#00FF88]/80 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="animate-in zoom-in mt-8 rounded-xl border border-[#00FF88]/30 bg-[#00FF88]/10 p-6 text-center duration-300">
      <LuCheck className="mx-auto mb-4 text-5xl text-[#00FF88]" />
      <h3 className="mb-2 text-xl font-bold text-[#E0E0E0]">
        Histórico Importado!
      </h3>
      <p className="text-[#888888]">
        Suas disciplinas e notas já estão no seu dashboard.
      </p>
      <button onClick={onUpdate}>atualizar dashboard</button>
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
    <Card className="mx-auto mt-10 w-full max-w-2xl border-[#1A1A1A] bg-[#121212] text-[#E0E0E0]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <LuFileText className="text-[#007AFF]" />
          Importar Histórico Escolar
        </CardTitle>
        <CardDescription className="text-[#888888]">
          Envie seu histórico em PDF. Nossa IA vai ler o documento e extrair
          todas as suas disciplinas e notas automaticamente.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
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
