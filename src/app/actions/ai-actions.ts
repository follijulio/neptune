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

export async function generateQuestionsAction(documentId: string) {
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
    const pdfBuffer = Buffer.from(arrayBuffer);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      Você é um professor extraindo questões de uma prova/lista de exercícios.
      Analise este documento PDF e extraia TODAS as questões encontradas.
      
      REGRA DE OURO PARA MATEMÁTICA E JSON: 
      Sempre que houver fórmulas, utilize a sintaxe LaTeX.
      COMO VOCÊ ESTÁ GERANDO UM JSON, AS BARRAS INVERTIDAS DEVEM SER DUPLAMENTE ESCAPADAS.
      Escreva "\\\\sqrt{4 - x^2}" e NUNCA "\\sqrt{4 - x^2}".
      Escreva "\\\\frac{1}{2}" e NUNCA "\\frac{1}{2}".
      Escreva "\\\\begin{cases}" e NUNCA "\\begin{cases}".
      Use $ para matemática inline e $$ para blocos de equação.
      
      Retorne estritamente um JSON no seguinte formato de array:
      [
        {
          "fullText": "O enunciado completo da questão com o LaTeX aplicado...",
          "providedData": ["Dado 1", "Dado 2"],
          "keyTopics": ["Assunto 1", "Assunto 2"],
          "expectedType": "calculo"
        }
      ]
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
    ]);

    let responseText = result.response.text();
    responseText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Formato de resposta inválido da IA.");
    }

    const savedQuestions = await Promise.all(
      parsedQuestions.map((q: any, index: number) =>
        prisma.question.create({
          data: {
            referenceIndex: index + 1,
            fullText: q.fullText,
            providedData: q.providedData || [],
            keyTopics: q.keyTopics || [],
            expectedType: q.expectedType || "texto",
            documentId: studyDoc.id,
          },
        }),
      ),
    );

    return { success: true, questions: savedQuestions };
  } catch (error) {
    return {
      error:
        "Falha ao extrair as questões do documento." +
        (error instanceof Error ? ` Detalhes: ${error.message}` : { error }),
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
