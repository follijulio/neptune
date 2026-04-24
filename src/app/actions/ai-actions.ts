"use server";

import { generateJsonByTask } from "../../lib/ai-router";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

export interface GenerateQuestionsResponse {
  success?: boolean;
  error?: string;
  count?: number;
  questions?: unknown[];
}

interface ExtractedQuestion {
  fullText: string;
  providedData?: string[];
  keyTopics?: string[];
  expectedType?: string;
}

export async function generateQuestionsAction(
  documentId: string,
): Promise<GenerateQuestionsResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado." };

  try {
    const studyDoc = await prisma.studyDocument.findUnique({
      where: { id: documentId },
    });

    if (!studyDoc || !studyDoc.fileUrl) {
      return { error: "Documento não encontrado ou URL inválida." };
    }

    const response = await fetch(studyDoc.fileUrl);
    if (!response.ok) {
      throw new Error(`Erro ao buscar PDF da nuvem: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const MAX_QUEST_PDF_SIZE = 8 * 1024 * 1024;

    if (arrayBuffer.byteLength > MAX_QUEST_PDF_SIZE) {
      return {
        error:
          "PDF muito grande para extração automática. Envie um arquivo de até 8MB.",
      };
    }

    const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Você é um professor extraindo questões de um PDF.
Extraia questões matemáticas identificáveis, com limite máximo de 20 questões.

Retorne ESTRITAMENTE um ARRAY JSON:
[
  {
    "fullText": "...",
    "providedData": ["..."],
    "keyTopics": ["..."],
    "expectedType": "calculo"
  }
]

Regras:
- Use LaTeX quando necessário com barras duplas escapadas em JSON.
- Se não houver questão, retorne [].
`;

    const parsedQuestions = await generateJsonByTask<ExtractedQuestion[]>({
      task: "pdf_question_extraction",
      prompt,
      pdfBase64,
    });

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return { error: "Nenhuma questão válida foi extraída do documento." };
    }

    const savedQuestions = await Promise.all(
      parsedQuestions.map((q, index) =>
        prisma.question.create({
          data: {
            referenceIndex: index + 1,
            fullText:
              typeof q.fullText === "string" && q.fullText.trim().length > 0
                ? q.fullText.trim()
                : `Questão ${index + 1}`,
            providedData: Array.isArray(q.providedData) ? q.providedData : [],
            keyTopics: Array.isArray(q.keyTopics) ? q.keyTopics : [],
            expectedType:
              typeof q.expectedType === "string" && q.expectedType.trim()
                ? q.expectedType.trim()
                : "texto",
            documentId: studyDoc.id,
          },
        }),
      ),
    );

    return {
      success: true,
      count: savedQuestions.length,
      questions: savedQuestions,
    };
  } catch (error) {
    return {
      error:
        "Falha ao extrair as questões do documento." +
        (error instanceof Error ? ` Detalhes: ${error.message}` : ""),
    };
  }
}

export interface EvaluateAnswerResponse {
  success?: boolean;
  error?: string;
  evaluation?: {
    isFullyCorrect: boolean;
    logicalScore: number;
    aiFeedback: string;
    difficultyTags: string[];
  };
}

interface AIEvaluation {
  isFullyCorrect: boolean;
  logicalScore: number;
  aiFeedback: string;
  difficultyTags: string[];
}

export async function evaluateAnswerAction(
  questionId: string,
  studentAnswer?: string,
  answerImageUrl?: string,
): Promise<EvaluateAnswerResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado." };
  const userId = session.user.id;

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) return { error: "Questão não encontrada." };

    const prompt = `
Avalie o raciocínio lógico do aluno para esta questão:
${question.fullText}

Dados fornecidos: ${question.providedData.join(", ") || "Nenhum"}.

Responda ESTRITAMENTE em JSON com:
{
  "isFullyCorrect": boolean,
  "logicalScore": number (0 a 10),
  "aiFeedback": string (incentivadora e técnica),
  "difficultyTags": string[]
}

${studentAnswer ? `Resposta em texto do aluno: "${studentAnswer}"` : ""}
${answerImageUrl ? `Há também resposta manuscrita em imagem.` : ""}
`;

    let aiEvaluation: AIEvaluation;

    if (answerImageUrl) {
      const imageResp = await fetch(answerImageUrl);
      if (!imageResp.ok) {
        return { error: "Não foi possível carregar a imagem da resposta." };
      }

      const buffer = await imageResp.arrayBuffer();
      const imageBase64 = Buffer.from(buffer).toString("base64");

      aiEvaluation = await generateJsonByTask<AIEvaluation>({
        task: "answer_evaluation_multimodal",
        prompt,
        imageBase64,
        imageMimeType: "image/jpeg",
      });
    } else {
      aiEvaluation = await generateJsonByTask<AIEvaluation>({
        task: "answer_evaluation_text",
        prompt,
      });
    }

    const normalized: AIEvaluation = {
      isFullyCorrect: Boolean(aiEvaluation?.isFullyCorrect),
      logicalScore: Math.max(
        0,
        Math.min(10, Number(aiEvaluation?.logicalScore ?? 0)),
      ),
      aiFeedback:
        typeof aiEvaluation?.aiFeedback === "string" &&
        aiEvaluation.aiFeedback.trim()
          ? aiEvaluation.aiFeedback.trim()
          : "Boa tentativa! Continue praticando para evoluir seu raciocínio.",
      difficultyTags: Array.isArray(aiEvaluation?.difficultyTags)
        ? aiEvaluation.difficultyTags.filter((t) => typeof t === "string")
        : [],
    };

    await prisma.$transaction(async (tx) => {
      await tx.attempt.create({
        data: {
          studentAnswer: studentAnswer || "Resposta por imagem",
          answerImageUrl: answerImageUrl || null,
          isFullyCorrect: normalized.isFullyCorrect,
          logicalScore: normalized.logicalScore,
          aiFeedback: normalized.aiFeedback,
          userId,
          questionId: question.id,
        },
      });

      const xpGanhado = normalized.isFullyCorrect ? 150 : 50;
      await tx.user.update({
        where: { id: userId },
        data: { xp: { increment: xpGanhado } },
      });

      if (!normalized.isFullyCorrect && normalized.difficultyTags.length > 0) {
        await tx.difficultyTag.createMany({
          data: normalized.difficultyTags.map((name) => ({
            userId,
            name,
          })),
          skipDuplicates: true,
        });
      }
    });

    return { success: true, evaluation: normalized };
  } catch (error) {
    return {
      error:
        "Erro na avaliação da resposta." +
        (error instanceof Error ? ` Detalhes: ${error.message}` : ""),
    };
  }
}

export interface GenerateBossResponse {
  success?: boolean;
  error?: string;
  question?: unknown;
}

interface BossQuestionPayload {
  referenceIndex?: number;
  fullText: string;
  providedData?: string[];
  keyTopics?: string[];
  expectedType?: string;
}

export async function generateBossChallengeAction(): Promise<GenerateBossResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  const userId = session.user.id;

  try {
    const recentTags = await prisma.difficultyTag.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { name: true },
    });

    const tagNames = recentTags.map((t) => t.name);

    if (tagNames.length === 0) {
      return {
        error:
          "Você ainda não tem um histórico de dificuldades. Resolva mais questões normais primeiro para liberar o Boss!",
      };
    }

    const prompt = `
Você é "Netuno", um professor especialista em avaliação por competências.
Gere UMA única questão Boss Challenge avançada e específica.

Tema obrigatório (dificuldades recentes do aluno):
[ ${tagNames.join(" | ")} ]

Regras obrigatórias:
1) A questão deve combinar pelo menos 2 dos temas listados.
2) O enunciado deve ter contexto real (aplicado), com dados numéricos concretos.
3) Deve exigir raciocínio em múltiplas etapas (não pode ser resolvida em 1 passo direto).
4) Inclua 3 a 5 dados em "providedData", úteis para a resolução.
5) "keyTopics" deve conter exatamente 3 itens: dois temas da lista + "Desafio Boss".
6) "expectedType" deve ser "calculo_logico".
7) Proibido enunciado genérico como "resolva", "calcule" sem contexto.
8) Dificuldade: alta, mas solucionável por aluno universitário.

Retorne ESTRITAMENTE JSON:
{
  "referenceIndex": 999,
  "fullText": "Enunciado completo, específico e contextualizado...",
  "providedData": ["dado 1", "dado 2", "dado 3"],
  "keyTopics": ["tema1", "tema2", "Desafio Boss"],
  "expectedType": "calculo_logico"
}
`;
    const parsedJson = await generateJsonByTask<BossQuestionPayload>({
      task: "boss_generation",
      prompt,
    });

    if (!parsedJson?.fullText || typeof parsedJson.fullText !== "string") {
      return { error: "A IA não retornou uma questão válida para o Boss." };
    }

    const bossQuestion = await prisma.question.create({
      data: {
        referenceIndex: parsedJson.referenceIndex || 999,
        fullText: parsedJson.fullText,
        providedData: Array.isArray(parsedJson.providedData)
          ? parsedJson.providedData
          : [],
        keyTopics: Array.isArray(parsedJson.keyTopics)
          ? parsedJson.keyTopics
          : ["Desafio Final"],
        expectedType: parsedJson.expectedType || "texto_dissertativo",
      },
    });

    return { success: true, question: bossQuestion };
  } catch (error) {
    console.error("Erro na Action generateBossChallengeAction:", error);
    return {
      error:
        "Ocorreu um erro ao invocar o Desafio Netuno." +
        (error instanceof Error ? ` Detalhes: ${error.message}` : ""),
    };
  }
}

export async function getUserQuestHistoryAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado." };

  try {
    const documents = await prisma.studyDocument.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        questions: true,
      },
    });

    return { success: true, history: documents };
  } catch (error) {
    console.error("Erro ao buscar histórico de quests:", error);
    return { error: "Falha ao carregar seus materiais de treino anteriores." };
  }
}
