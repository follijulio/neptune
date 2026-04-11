"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export interface ParsedSubject {
  name: string;
  grade?: string | null;
  status: string;
  semester?: string | null;
  hours?: number | null;
}

type SubjectStatus = "PENDENTE" | "APROVADO" | "REPROVADO" | "CURSANDO";

interface ActionResult {
  success?: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function parseAcademicHistoryAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  try {
    const file = formData.get("pdfFile") as File | null;

    if (!file || typeof file !== "object" || file.type !== "application/pdf") {
      return { error: "Por favor, envie um arquivo PDF válido." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: "O arquivo excede o limite de 5MB." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataError", () =>
        reject(new Error("Falha na leitura do PDF.")),
      );
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    if (!rawText || rawText.trim().length === 0) {
      return { error: "O PDF enviado está vazio ou não contém texto legível." };
    }

    const prompt = `
      Você é um assistente especializado em extrair dados de históricos escolares brasileiros.
      Analise o texto abaixo, que foi extraído de um PDF de histórico escolar, e encontre as disciplinas cursadas.
      
      Retorne um array contendo objetos com as seguintes chaves (use os tipos corretos):
      - "name" (string): nome da disciplina (ex: Matemática, Português, Cálculo 1).
      - "grade" (string ou null): a nota final (ex: "8.5", "10", "A").
      - "status" (string): a situação (ex: APROVADO, REPROVADO, CURSANDO, TRANSFERIDO).
      - "semester" (string ou null): o semestre ou período letivo (ex: "2023.1", "2024.2", "1º Ano").
      - "hours" (number ou null): a carga horária da disciplina. Apenas o número inteiro (ex: 60, 90).

      Texto do histórico:
      ${rawText.substring(0, 25000)}
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let subjects: ParsedSubject[];
    try {
      subjects = JSON.parse(responseText || "[]");
      if (!Array.isArray(subjects)) throw new Error();
    } catch {
      return {
        error:
          "A análise do documento falhou devido a uma formatação inesperada.",
      };
    }

    return { success: true, subjects };
  } catch (error) {
    console.error("Erro no processamento do PDF:", error);
    return { error: "Falha ao processar o documento. Tente novamente." };
  }
}

export async function saveExtractedSubjectsAction(
  subjects: ParsedSubject[],
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  const userId = session.user.id;

  if (
    !Array.isArray(subjects) ||
    subjects.length === 0 ||
    subjects.length > 150
  ) {
    return {
      error: "Dados inválidos ou quantidade de disciplinas excede o limite.",
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        let newCompletedHours = 0;

        for (const rawSubject of subjects) {
          if (!rawSubject || typeof rawSubject !== "object") continue;

          const name =
            typeof rawSubject.name === "string"
              ? rawSubject.name.trim().substring(0, 150)
              : "Disciplina Desconhecida";
          const rawStatus =
            typeof rawSubject.status === "string"
              ? rawSubject.status.trim()
              : "";
          const rawSemester =
            typeof rawSubject.semester === "string"
              ? rawSubject.semester.trim().substring(0, 50)
              : "Sem Período";

          const status = parseSubjectStatus(rawStatus);
          const grade = parseGrade(rawSubject.grade);
          const hours = parseHours(rawSubject.hours);

          if (!name) continue;

          let semester = await tx.semester.findFirst({
            where: { userId, title: rawSemester },
          });

          if (!semester) {
            semester = await tx.semester.create({
              data: { userId, title: rawSemester },
            });
          }

          let subject = await tx.subject.findFirst({
            where: { name, semesterId: semester.id },
          });

          if (!subject) {
            subject = await tx.subject.create({
              data: {
                name,
                workload: hours,
                maxAbsences: Math.floor(hours * 0.25),
                semesterId: semester.id,
              },
            });
          }

          const existingEnrollment = await tx.enrollment.findFirst({
            where: { userId, subjectId: subject.id, semesterId: semester.id },
          });

          if (!existingEnrollment) {
            await tx.enrollment.create({
              data: {
                userId,
                status,
                grade,
                subjectId: subject.id,
                semesterId: semester.id,
              },
            });

            if (status === "APROVADO" && hours > 0) {
              newCompletedHours += hours;
            }
          }
        }

        if (newCompletedHours > 0) {
          const existingWorkload = await tx.workload.findFirst({
            where: { userId, category: "Obrigatórias" },
          });

          if (existingWorkload) {
            await tx.workload.update({
              where: { id: existingWorkload.id },
              data: {
                completedHours:
                  existingWorkload.completedHours + newCompletedHours,
              },
            });
          } else {
            await tx.workload.create({
              data: {
                userId,
                category: "Obrigatórias",
                totalHours: 3200,
                completedHours: newCompletedHours,
              },
            });
          }
        }
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    return { success: true };
  } catch {
    return {
      error:
        "Não foi possível salvar o histórico. Verifique os dados e tente novamente.",
    };
  }
}

function parseSubjectStatus(status: string): SubjectStatus {
  const normalized = status.toUpperCase();

  if (normalized.includes("APROV")) return "APROVADO";
  if (normalized.includes("REP")) return "REPROVADO";
  if (normalized.includes("CURS")) return "CURSANDO";

  return "PENDENTE";
}

function parseGrade(grade: unknown): number | null {
  if (grade === null || grade === undefined) return null;
  const gradeStr = String(grade).replace(",", ".");
  const parsed = parseFloat(gradeStr);
  if (isNaN(parsed) || parsed < 0 || parsed > 10) return null;
  return parsed;
}

function parseHours(hours: unknown): number {
  if (hours === null || hours === undefined) return 60;
  const parsed = parseInt(String(hours), 10);
  if (isNaN(parsed) || parsed < 0 || parsed > 1000) return 60;
  return parsed;
}
