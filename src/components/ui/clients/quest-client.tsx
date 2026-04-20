"use client";

import { useEffect, useState } from "react";
import {
  LuBrainCircuit,
  LuCircleCheck,
  LuCloudUpload,
  LuCircleX,
  LuSwords,
  LuDna,
  LuHistory,
} from "react-icons/lu";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { LuTrash2 } from "react-icons/lu";
import { deleteStudyDocumentAction } from "@/src/app/actions/study-document-actions";
import { Alert } from "@/src/components/shadcn-ui/alert";
import { GiHarpoonTrident } from "react-icons/gi";
import { toast } from "sonner";
import { generateUploadButton } from "@uploadthing/react";

import type { OurFileRouter } from "@/src/app/api/uploadthing/core";
import { Button } from "@/src/components/shadcn-ui/button";
import { Dialog, DialogContent } from "@/src/components/shadcn-ui/dialog";
import {
  generateQuestionsAction,
  evaluateAnswerAction,
  generateBossChallengeAction,
  getUserQuestHistoryAction,
} from "@/src/app/actions/ai-actions";
import { TbAlertTriangle } from "react-icons/tb";
import { Spinner } from "../../shadcn-ui/spinner";

const UploadButton = generateUploadButton<OurFileRouter>();

type Question = {
  id: string;
  fullText: string;
  keyTopics: string[];
  providedData?: string[];
};

type DocumentHistory = {
  id: string;
  title: string;
  createdAt: Date;
  questions: Question[];
};

type Feedback = {
  isFullyCorrect: boolean;
  logicalScore: number;
  aiFeedback: string;
  difficultyTags: string[];
};

export default function QuestsClient() {
  const [activeTab, setActiveTab] = useState<"training" | "boss">("training");
  const [documentId, setDocumentId] = useState<string | null>(null);

  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const [history, setHistory] = useState<DocumentHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [answerText, setAnswerText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [isInvokingBoss, setIsInvokingBoss] = useState(false);
  const [bossQuestion, setBossQuestion] = useState<Question | null>(null);

  const [questError, setQuestError] = useState<string | null>(null);
  const [bossError, setBossError] = useState<string | null>(null);

  useEffect(() => {
    getUserQuestHistoryAction().then((res) => {
      if (res.success && res.history) {
        setHistory(res.history as DocumentHistory[]);
        if (res.history.length > 0 && res.history[0].questions.length > 0) {
          setDocumentId(res.history[0].id);
          setQuestions(res.history[0].questions);
        }
      }
      setIsLoadingHistory(false);
    });
  }, []);

  function loadHistoricalDocument(doc: DocumentHistory) {
    setDocumentId(doc.id);
    setQuestions(doc.questions);
    toast.info(`Arquivo neural "${doc.title}" carregado.`);
  }

  function openQuestion(question: Question) {
    setSelectedQuestion(question);
    setAnswerText("");
    setFeedback(null);
  }

  function closeQuestionDialog() {
    setSelectedQuestion(null);
    setAnswerText("");
    setFeedback(null);
  }

  async function handleGenerateQuestions() {
    if (!documentId) return;
    setIsGenerating(true);
    setQuestError(null);
    toast.loading("O Agente Netuno está lendo o documento...", {
      id: "gen-questions",
    });

    try {
      const response = await generateQuestionsAction(documentId);
      if (response.error) {
        setQuestError(response.error);
        toast.dismiss("gen-questions");
      } else if (response.questions) {
        setQuestions(response.questions);
        toast.success(`${response.questions.length} questões extraídas!`, {
          id: "gen-questions",
        });
        setHistory((prev) =>
          prev.map((d) =>
            d.id === documentId
              ? { ...d, questions: response.questions ?? [] }
              : d,
          ),
        );
      }
    } catch (error: any) {
      setQuestError(error.message || "Falha crítica ao comunicar com a IA.");
      toast.dismiss("gen-questions");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleInvokeBoss() {
    setIsInvokingBoss(true);
    setBossError(null);
    toast.loading("O sistema está analisando suas vulnerabilidades...", {
      id: "invoke-boss",
    });

    try {
      const response = await generateBossChallengeAction();
      if (response.error) {
        setBossError(response.error);
        toast.dismiss("invoke-boss");
      } else if (response.question) {
        setBossQuestion(response.question);
        toast.success("O Desafio Netuno foi invocado!", { id: "invoke-boss" });
      }
    } catch (error: any) {
      setBossError(error.message || "Erro catastrófico ao gerar o Boss.");
      toast.dismiss("invoke-boss");
    } finally {
      setIsInvokingBoss(false);
    }
  }

  async function handleAnswerSubmit() {
    if (!answerText.trim() || !selectedQuestion) return;

    setIsEvaluating(true);
    toast.loading("Avaliando sua lógica...", { id: "eval-answer" });

    try {
      const response = await evaluateAnswerAction(
        selectedQuestion.id,
        answerText,
      );
      if (response.error) {
        toast.error(response.error, { id: "eval-answer" });
      } else if (response.evaluation) {
        setFeedback(response.evaluation as Feedback);
        if ((response.evaluation as Feedback).isFullyCorrect) {
          toast.success("Raciocínio impecável!", { id: "eval-answer" });
        } else {
          toast.warning("Foram detectadas falhas na sua lógica.", {
            id: "eval-answer",
          });
        }
      }
    } catch {
      toast.error("Falha ao avaliar resposta.", { id: "eval-answer" });
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <section className="px-4 sm:px-0">
      <div className="h-full w-full">
        <header className="flex flex-col gap-4 border-b border-[#1A1A1A] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Quests</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Transforme materiais brutos em conhecimento sólido.
            </p>
          </div>

          <div className="flex rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-1">
            <button
              onClick={() => setActiveTab("training")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "training"
                  ? "bg-[#1A1A1A] text-[#007AFF]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <LuDna className="h-4 w-4" /> Treinamento
            </button>
            <button
              onClick={() => setActiveTab("boss")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "boss"
                  ? "bg-[#1A1A1A] text-[#FF3B30]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <LuSwords className="h-4 w-4" /> Desafio Boss
            </button>
          </div>
        </header>

        <div className="mt-8">
          {activeTab === "training" ? (
            <div className="animate-in fade-in space-y-6 duration-500">
              {questError && (
                <Alert
                  variant="destructive"
                  className="flex items-start gap-3 border border-red-900/50 bg-red-950/50 p-4"
                >
                  <TbAlertTriangle className="h-10 w-10 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-bold text-red-400">
                      Falha na Ingestão de Dados
                    </h3>
                    <p className="mt-1 text-sm text-zinc-300">
                      ERRO: {questError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setQuestError(null)}
                      className="mt-3 h-8 border-red-900/50 bg-transparent text-xs text-white hover:bg-red-900/30"
                    >
                      Entendido, vou tentar novamente
                    </Button>
                  </div>
                </Alert>
              )}
              {history.length > 0 && (
                <div className="custom-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDocumentId(null);
                      setQuestions([]);
                    }}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${!documentId ? "border-[#007AFF]/50 bg-[#1A1A1A] text-[#007AFF]" : "border-[#1A1A1A] bg-[#0A0A0A] text-zinc-500 hover:text-black"}`}
                  >
                    + Novo Material
                  </Button>
                  {history.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => loadHistoricalDocument(doc)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                        documentId === doc.id
                          ? "border-[#007AFF]/50 bg-[#1A1A1A] text-[#007AFF]"
                          : "border-[#1A1A1A] bg-[#0A0A0A] text-zinc-500 hover:text-white"
                      }`}
                    >
                      <LuHistory className="h-4 w-4" />
                      <span className="max-w-37.5 truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {!documentId ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1A1A1A] bg-[#0A0A0A] py-16 text-center">
                  <LuCloudUpload className="h-10 w-10 text-[#007AFF]" />
                  <h3 className="mt-4 text-lg font-bold text-white">
                    Módulo de Ingestão
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-zinc-500">
                    Suba o PDF da sua prova ou lista para que a IA mapeie suas
                    habilidades.
                  </p>
                  <UploadButton
                    endpoint="studyDocument"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.serverData) {
                        const newDocId = res[0].serverData.documentId as string;
                        setDocumentId(newDocId);
                        setHistory((prev) => [
                          {
                            id: newDocId,
                            title: res[0].name,
                            createdAt: new Date(),
                            questions: [],
                          },
                          ...prev,
                        ]);
                      }
                      toast.success("Material recebido!");
                    }}
                    appearance={{
                      button:
                        "mt-6 rounded-xl bg-[#007AFF] px-6 py-5 text-sm font-bold w-auto border-none",
                      allowedContent: "hidden",
                    }}
                    content={{
                      button: ({ isUploading }) =>
                        isUploading ? "Sincronizando..." : "Selecionar PDF",
                    }}
                  />
                </div>
              ) : questions.length === 0 ? (
                <div className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] py-16 text-center">
                  <LuBrainCircuit className="mx-auto h-10 w-10 text-[#007AFF]" />
                  <h3 className="mt-4 text-lg font-bold text-white">
                    Análise Pronta
                  </h3>
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                    className="mt-6 bg-[#007AFF] hover:bg-[#005bb5]"
                  >
                    {isGenerating ? "Extraindo..." : "Gerar Questões do PDF"}
                    {isGenerating && <Spinner />}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#007AFF]">
                          QUESTÃO {idx + 1}
                        </span>
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 mt-3 max-w-none overflow-x-auto text-sm leading-relaxed text-[#E0E0E0]">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {q.fullText}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <Button
                        onClick={() => openQuestion(q)}
                        className="mt-6 w-full bg-zinc-900 hover:bg-[#1A1A1A]"
                      >
                        Resolver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 flex flex-col items-center justify-center space-y-8 py-12 duration-500">
              <div className="text-center">
                <div className="relative inline-block">
                  <GiHarpoonTrident className="h-20 w-20 animate-pulse text-[#FF3B30]" />
                  <div className="absolute -inset-4 -z-10 rounded-full bg-[#FF3B30]/10 blur-2xl" />
                </div>
                <h2 className="mt-6 text-3xl font-black tracking-tighter text-white">
                  ARENA NETUNO
                </h2>
                <p className="mx-auto mt-2 max-w-md text-zinc-500">
                  O Boss será gerado baseando-se exclusivamente nos seus erros
                  recentes. Vencer aqui garante insígnias raras.
                </p>
              </div>

              {bossError && (
                <Alert
                  variant="destructive"
                  className="flex w-full max-w-2xl items-start gap-3 border border-red-900/50 bg-red-950/50 p-4"
                >
                  <TbAlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-bold text-red-400">
                      Acesso Negado à Arena
                    </h3>
                    <p className="mt-1 text-sm text-zinc-300">{bossError}</p>
                    <Button
                      variant="outline"
                      onClick={() => setBossError(null)}
                      className="mt-3 h-8 border-red-900/50 bg-transparent text-xs text-white hover:bg-red-900/30"
                    >
                      Voltar ao Treinamento
                    </Button>
                  </div>
                </Alert>
              )}

              {!bossQuestion ? (
                <div className="w-full max-w-2xl rounded-3xl border border-[#FF3B30]/30 bg-black/40 p-6 shadow-[0_0_40px_rgba(255,59,48,0.12)]">
                  <div className="mb-4 flex items-center gap-2">
                    <GiHarpoonTrident className="h-5 w-5 text-[#FF3B30]" />
                    <span className="text-xs font-black tracking-[0.2em] text-[#FF3B30] uppercase">
                      Protocolo Netuno
                    </span>
                  </div>

                  <p className="text-lg leading-relaxed font-semibold text-white">
                    Pronto para o confronto?
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    O sistema vai montar um desafio inédito com foco nos seus
                    pontos fracos mais recentes. Sem múltipla escolha, sem
                    atalhos — só raciocínio.
                  </p>

                  <Button
                    onClick={handleInvokeBoss}
                    disabled={isInvokingBoss}
                    className="mt-6 h-16 w-full rounded-2xl bg-[#FF3B30] px-10 text-lg font-black shadow-[0_0_30px_rgba(255,59,48,0.3)] transition-all hover:scale-[1.02] hover:bg-[#D32F2F] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isInvokingBoss
                      ? "MONTANDO O DESAFIO..."
                      : "INICIAR CONFRONTO PERSONALIZADO"}
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-2xl rounded-3xl border-2 border-[#FF3B30]/30 bg-black p-8 shadow-[0_0_50px_rgba(255,59,48,0.1)]">
                  <div className="mb-4 flex items-center gap-2 text-[#FF3B30]">
                    <LuSwords className="h-5 w-5" />
                    <span className="text-sm font-bold tracking-widest uppercase">
                      Desafio Ativo
                    </span>
                  </div>
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 max-w-none overflow-x-auto text-xl leading-relaxed font-medium text-white">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {bossQuestion.fullText}
                    </ReactMarkdown>
                  </div>
                  <Button
                    onClick={() => openQuestion(bossQuestion)}
                    className="mt-8 h-12 w-full bg-[#FF3B30] font-bold hover:bg-[#D32F2F]"
                  >
                    ENTRAR EM BATALHA
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <Dialog
          open={!!selectedQuestion}
          onOpenChange={(open) => !open && closeQuestionDialog()}
        >
          <DialogContent className="w-2/3 max-w-5xl overflow-y-auto rounded-2xl border-[#1A1A1A] bg-[#121212] p-0 text-white">
            {selectedQuestion && (
              <div className="flex w-full flex-col">
                <div
                  className={`border-b border-[#1A1A1A] p-6 ${
                    activeTab === "boss" ? "bg-[#FF3B30]/5" : "bg-[#007AFF]/5"
                  }`}
                >
                  <span
                    className={`text-xs font-black tracking-widest uppercase ${
                      activeTab === "boss" ? "text-[#FF3B30]" : "text-[#007AFF]"
                    }`}
                  >
                    {activeTab === "boss"
                      ? "Confronto Final"
                      : "Exercício de Fixação"}
                  </span>
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 mt-4 max-w-none overflow-x-auto text-lg leading-relaxed text-[#E0E0E0]">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {selectedQuestion.fullText}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {!feedback ? (
                    <>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Descreva seu raciocínio passo a passo..."
                        className="min-h-[200px] w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-white outline-none focus:ring-1 focus:ring-[#007AFF]"
                      />
                      <Button
                        onClick={handleAnswerSubmit}
                        disabled={isEvaluating || !answerText.trim()}
                        className={`h-12 w-full font-bold ${
                          activeTab === "boss"
                            ? "bg-[#FF3B30] hover:bg-[#D32F2F]"
                            : "bg-[#007AFF] hover:bg-[#005bb5]"
                        }`}
                      >
                        {isEvaluating
                          ? "O Agente está analisando..."
                          : "Submeter Resposta"}
                      </Button>
                    </>
                  ) : (
                    <div className="animate-in zoom-in-95 space-y-6 duration-300">
                      <div className="flex items-center gap-4">
                        {feedback.isFullyCorrect ? (
                          <LuCircleCheck className="h-10 w-10 text-emerald-500" />
                        ) : (
                          <LuCircleX className="h-10 w-10 text-rose-500" />
                        )}
                        <div>
                          <h4 className="text-xl font-bold">
                            Desempenho: {feedback.logicalScore}/10
                          </h4>
                          <p className="text-sm text-zinc-500">
                            {feedback.aiFeedback}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setFeedback(null)}
                        variant="outline"
                        className="w-full border-zinc-800"
                      >
                        Revisar e Tentar Novamente
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
