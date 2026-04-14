"use server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export interface GenerateQuestionsResponse {
  success?: boolean;
  error?: string;
  count?: number;
  questions?: any[];
}

export async function generateQuestionsAction(
  documentId: string,
): Promise<GenerateQuestionsResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  try {
    const studyDocument = await prisma.studyDocument.findUnique({
      where: { id: documentId, userId: session.user.id },
    });

    if (!studyDocument) {
      return { error: "Documento não encontrado." };
    }

    if (!studyDocument.rawText) {
      return {
        error: "O documento não possui texto extraído para ser analisado.",
      };
    }

    const EXTRACTQUESTIONSPROMPT = `
      Você é um especialista em educação encarregado de extrair questões de um texto bruto e não estruturado.
      Abaixo está o conteúdo de um PDF educacional (prova, lista de exercícios ou apostila).
      Sua tarefa é encontrar todas as perguntas contidas no texto e retorná-las no formato JSON exato especificado.

      Diretrizes Críticas:
      - Extraia APENAS perguntas genuínas. Ignore títulos gerais de capítulos ou textos introdutórios que não fazem parte do enunciado.
      - Tente inferir a numeração da questão (ex: "1.", "Questão 2") no campo "referenceIndex".
      - Em "providedData", extraia dados numéricos importantes ou premissas dadas no enunciado (ex: "G = 10m/s²", "Aceleração = 5", "Massa = 5kg"). Se não houver, retorne um array vazio [].
      - Em "keyTopics", inferir de 1 a 3 assuntos essenciais para resolver a questão (ex: "Cinemática", "Interpretação de Texto", "Equações de 2º Grau").

      O formato de saída DEVE ser estritamente este JSON (nenhum outro texto):
      {
      "questoes": [
        {
        "referenceIndex": 1,
        "fullText": "Texto integral da questão aqui...",
        "providedData": ["dado 1", "dado 2"],
        "keyTopics": ["assunto 1", "assunto 2"],
        "expectedType": "calculo_logico" // ou "texto_dissertativo"
        }
      ]
      }

      Texto do Documento:
      ---
      ${studyDocument.rawText.substring(0, 30000)}
      ---
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(EXTRACTQUESTIONSPROMPT);
    const responseText = result.response.text();

    const parsedJson = JSON.parse(responseText);
    const questoes = parsedJson.questoes;

    if (!Array.isArray(questoes) || questoes.length === 0) {
      return { error: "Nenhuma questão foi encontrada no texto analisado." };
    }

    await prisma.$transaction(async (tx) => {
      for (const q of questoes) {
        await tx.question.create({
          data: {
            referenceIndex: q.referenceIndex || null,
            fullText: q.fullText,
            providedData: q.providedData || [],
            keyTopics: q.keyTopics || [],
            expectedType: q.expectedType || "texto_dissertativo",
            documentId: documentId,
          },
        });
      }
    });

    const savedQuestions = await prisma.question.findMany({
      where: { documentId: documentId },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, count: questoes.length, questions: savedQuestions };
  } catch (error) {
    console.error("Erro na Server Action generateQuestionsAction:", error);
    return { error: "Ocorreu um erro ao gerar as questões a partir do texto." };
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

    let promptContent: any[] = [
      `Avalie o raciocínio lógico do aluno para esta questão: ${question.fullText}. 
       Dados fornecidos: ${question.providedData.join(", ")}.
       
       Responda estritamente em JSON com: isFullyCorrect (boolean), logicalScore (0-10), 
       aiFeedback (string incentivadora e técnica) e difficultyTags (array de strings se houver erro).`,
    ];

    if (answerImageUrl) {
      const imageResp = await fetch(answerImageUrl);
      const buffer = await imageResp.arrayBuffer();
      promptContent.push({
        inlineData: {
          data: Buffer.from(buffer).toString("base64"),
          mimeType: "image/jpeg",
        },
      });
      promptContent.push("Analise os cálculos manuscritos nesta imagem.");
    }

    if (studentAnswer) {
      promptContent.push(`Resposta em texto do aluno: "${studentAnswer}"`);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(promptContent);
    const aiEvaluation = JSON.parse(result.response.text());

    await prisma.$transaction(async (tx) => {
      await tx.attempt.create({
        data: {
          studentAnswer: studentAnswer || "Resposta por imagem",
          answerImageUrl: answerImageUrl,
          isFullyCorrect: aiEvaluation.isFullyCorrect,
          logicalScore: aiEvaluation.logicalScore,
          aiFeedback: aiEvaluation.aiFeedback,
          userId: userId,
          questionId: question.id,
        },
      });

      const xpGanhado = aiEvaluation.isFullyCorrect ? 150 : 50;
      await tx.user.update({
        where: { id: userId },
        data: { xp: { increment: xpGanhado } },
      });
    });

    return { success: true, evaluation: aiEvaluation };
  } catch (error) {
    return { error: "Erro na avaliação multimodal." };
  }
}

export interface GenerateBossResponse {
  success?: boolean;
  error?: string;
  question?: any;
}

export async function generateBossChallengeAction(): Promise<GenerateBossResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  const userId = session.user.id;

  try {
    const recentTags = await prisma.difficultyTag.findMany({
      where: { userId: userId },
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

    const GENERATEBOSSCHALLENGEPROMPT = `
      Você é 'Netuno', o Mestre de Jogo e professor de uma plataforma gamificada de estudos.
      Sua tarefa é gerar uma ÚNICA QUESTÃO DE NÍVEL DIFÍCIL (Boss Challenge) para o aluno.
      
      Esta questão deve OBRIGATORIAMENTE envolver os seguintes assuntos em que o aluno tem demonstrado dificuldade recentemente:
      [ ${tagNames.join(" | ")} ]
      
      Diretrizes Críticas:
      - Crie um enunciado criativo, profundo e que exija raciocínio lógico cruzado entre esses assuntos.
      - Não torne a questão impossível, mas exija que ele demonstre domínio nos pontos onde costumava errar.
      - Retorne os dados estritamente no formato JSON abaixo.

      O formato de saída DEVE ser estritamente este JSON (nenhum outro texto):
      {
      "referenceIndex": 999,
      "fullText": "O enunciado épico da questão...",
      "providedData": ["Dado Importante 1", "Dado Importante 2"],
      "keyTopics": ["${tagNames[0]}", "Desafio Boss"],
      "expectedType": "calculo_logico"
      }
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(GENERATEBOSSCHALLENGEPROMPT);
    const responseText = result.response.text();

    const parsedJson = JSON.parse(responseText);

    const bossQuestion = await prisma.question.create({
      data: {
        referenceIndex: parsedJson.referenceIndex || 999,
        fullText: parsedJson.fullText,
        providedData: parsedJson.providedData || [],
        keyTopics: parsedJson.keyTopics || ["Desafio Final"],
        expectedType: parsedJson.expectedType || "texto_dissertativo",
      },
    });

    return { success: true, question: bossQuestion };
  } catch (error) {
    console.error("Erro na Action generateBossChallengeAction:", error);
    return { error: "Ocorreu um erro ao invocar o Desafio Netuno." };
  }
}
