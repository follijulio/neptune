"use client";

import { useState } from "react";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/shadcn-ui/card";
import { LuUpload, LuFileText, LuCheck, LuCircleAlert } from "react-icons/lu";
import {
  parseAcademicHistoryAction,
  saveExtractedSubjectsAction,
} from "@/src/app/actions/pdf-actions";
import { Alert } from "../shadcn-ui/alert";
import { useRouter } from "next/navigation";

interface ParsedSubject {
  code?: string;
  name: string;
  grade?: string;
  status: string;
}

export default function PdfUploader() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ParsedSubject[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResults(null);
    }
  };
  const handleSaveToDatabase = async () => {
    if (!results) return;
    setIsSaving(true);
    setError(null);

    const response = await saveExtractedSubjectsAction(results);

    if (response.error) {
      setError(response.error);
      setIsSaving(false);
    } else if (response.success) {
      setSavedSuccess(true);
      setResults(null);
      setIsSaving(false);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };
  const handleUpload: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdfFile", file);

    const response = await parseAcademicHistoryAction(formData);

    if (response.error) {
      setError(response.error);
    } else if (response.subjects) {
      setResults(response.subjects);
    }

    setIsLoading(false);
  };

  const update = () => {
    window.location.reload();
  };

  return (
    <Card className="bg-[#121212] border-[#1A1A1A] text-[#E0E0E0] w-full max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
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
          <div className="relative border-2 border-dashed border-[#1A1A1A] hover:border-[#007AFF] transition-colors rounded-xl p-8 flex flex-col items-center justify-center bg-[#000000]/50 text-center cursor-pointer group">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <>
                <LuCheck className="text-4xl text-[#00FF88] mb-4" />
                <p className="text-[#E0E0E0] font-medium">{file.name}</p>
                <p className="text-sm text-[#888888] mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <LuUpload className="text-5xl text-[#888888] group-hover:text-[#007AFF] transition-colors mb-4" />
                <p className="text-[#E0E0E0] font-medium">
                  Clique ou arraste seu PDF aqui
                </p>
                <p className="text-sm text-[#888888] mt-1">
                  Apenas arquivos .pdf
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[#FF3B30] bg-[#FF3B30]/10 p-4 rounded-lg border border-[#FF3B30]/20">
              <LuCircleAlert className="text-xl shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!file || isLoading}
            className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/80 text-white font-bold text-lg rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analisando o documento..." : "Analisar Documento"}
          </Button>
          {isLoading && (
            <Alert className="mt-2 border-[#1A1A1A] bg-[#0B0B0B]/80 backdrop-blur-sm rounded-xl px-4 py-3 w-full">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#007AFF] animate-pulse shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-medium text-[#E0E0E0]">
                    Analisando seu histórico...
                  </p>
                  <p className="text-xs text-[#888888] mt-1">
                    Isso pode levar alguns segundos, dependendo do tamanho do
                    PDF.
                  </p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                    <div className="h-full w-2/3 rounded-full bg-[#007AFF] animate-pulse" />
                  </div>
                </div>
              </div>
            </Alert>
          )}
        </form>

        {results && !savedSuccess && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-[#E0E0E0] font-bold mb-4 flex items-center justify-between">
              <span>Disciplinas Encontradas ({results.length})</span>
            </h3>

            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar mb-6">
              {results.map((subject, index) => (
                <div
                  key={index}
                  className="bg-[#000000] border border-[#1A1A1A] rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[#E0E0E0] text-sm">
                      {subject.code ? `${subject.code} - ` : ""}
                      {subject.name}
                    </span>
                    <span className="text-xs text-[#888888] mt-1">
                      Status: {subject.status}
                    </span>
                  </div>
                  {subject.grade && (
                    <div className="bg-[#121212] px-3 py-1 rounded border border-[#1A1A1A] font-bold text-[#007AFF]">
                      {subject.grade}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="w-full h-12 bg-[#00FF88] hover:bg-[#00FF88]/80 text-[#000000] font-bold text-lg rounded-lg transition-all"
            >
              {isSaving
                ? "Salvando na sua conta..."
                : "Confirmar e Salvar no Meu Perfil"}
            </Button>
          </div>
        )}

        {savedSuccess && (
          <div className="mt-8 p-6 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl text-center animate-in zoom-in duration-300">
            <LuCheck className="text-5xl text-[#00FF88] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#E0E0E0] mb-2">
              Histórico Importado!
            </h3>
            <p className="text-[#888888]">
              Suas disciplinas e notas já estão no seu dashboard.
            </p>
            <button onClick={update}>atualizar dashboard</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
