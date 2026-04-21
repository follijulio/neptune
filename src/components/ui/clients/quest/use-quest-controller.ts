"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ActiveTab, DocumentHistory, Feedback, Question } from "./types";

import {
  evaluateAnswerAction,
  generateBossChallengeAction,
  generateQuestionsAction,
  getUserQuestHistoryAction,
} from "@/src/app/actions/ai-actions";
import { deleteStudyDocumentAction } from "@/src/app/actions/study-document-actions";

export function useQuestController() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("training");
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
        const firstDoc = res.history[0];
        if (firstDoc && firstDoc.questions.length > 0) {
          setDocumentId(firstDoc.id);
          setQuestions(firstDoc.questions);
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

  function resetToNewDocument() {
    setDocumentId(null);
    setQuestions([]);
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

  function handleUploadComplete(docId: string, name: string) {
    setDocumentId(docId);
    setHistory((prev) => [
      { id: docId, title: name, createdAt: new Date(), questions: [] },
      ...prev,
    ]);
  }

  async function handleDeleteDocument(docId: string, title: string) {
    if (deletingDocId) return;
    setDeletingDocId(docId);
    toast.loading(`Excluindo "${title}"...`, { id: "delete-doc" });

    try {
      const response = await deleteStudyDocumentAction(docId);

      if (response.error) {
        toast.error(response.error, { id: "delete-doc" });
        return;
      }

      setHistory((prev) => prev.filter((d) => d.id !== docId));

      if (documentId === docId) {
        setDocumentId(null);
        setQuestions([]);
        setSelectedQuestion(null);
        setFeedback(null);
        setAnswerText("");
      }

      toast.success("Material removido com sucesso.", { id: "delete-doc" });
    } catch {
      toast.error("Falha ao excluir material.", { id: "delete-doc" });
    } finally {
      setDeletingDocId(null);
    }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setQuestError(error.message || "Falha crítica ao comunicar com a IA.");
      } else {
        setQuestError("Falha crítica ao comunicar com a IA.");
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setBossError(error.message || "Erro catastrófico ao gerar o Boss.");
      } else {
        setBossError("Erro catastrófico ao gerar o Boss.");
      }
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
        const evaluation = response.evaluation as Feedback;
        setFeedback(evaluation);
        if (evaluation.isFullyCorrect) {
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

  return {
    activeTab,
    setActiveTab,
    documentId,
    deletingDocId,
    history,
    isLoadingHistory,
    isGenerating,
    questions,
    selectedQuestion,
    answerText,
    isEvaluating,
    feedback,
    isInvokingBoss,
    bossQuestion,
    questError,
    bossError,
    setQuestError,
    setBossError,
    setAnswerText,
    setFeedback,
    loadHistoricalDocument,
    resetToNewDocument,
    openQuestion,
    closeQuestionDialog,
    handleUploadComplete,
    handleDeleteDocument,
    handleGenerateQuestions,
    handleInvokeBoss,
    handleAnswerSubmit,
  };
}
