/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import PDFParser from "pdf2json";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";
import { generateJsonByTask } from "@/src/lib/ai-router";

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
Analise o texto abaixo e extraia disciplinas cursadas.

Retorne ESTRITAMENTE um array JSON com objetos contendo:
- "name" (string): nome da disciplina (ex: Matemática, Português, Cálculo 1)
- "grade" (string ou null): nota final (ex: "8.5", "10", "A")
- "status" (string): situação (APROVADO, REPROVADO, CURSANDO, TRANSFERIDO etc.)
- "semester" (string ou null): período letivo (ex: "2023.1", "2024.2", "1º Ano")
- "hours" (number ou null): carga horária inteira (ex: 60, 90)

Texto do histórico:
${rawText.substring(0, 25000)}
`;

    let subjects: ParsedSubject[];

    try {
      const aiResult = await generateJsonByTask<unknown>({
        task: "history_structuring",
        prompt,
      });

      let rawSubjects: unknown[] = [];

      if (Array.isArray(aiResult)) {
        rawSubjects = aiResult;
      } else if (
        aiResult &&
        typeof aiResult === "object" &&
        Array.isArray((aiResult as any).disciplinas)
      ) {
        rawSubjects = (aiResult as any).disciplinas;
      } else if (
        aiResult &&
        typeof aiResult === "object" &&
        Array.isArray((aiResult as any).subjects)
      ) {
        rawSubjects = (aiResult as any).subjects;
      } else {
        console.error("Resposta IA inesperada:", aiResult);
        return {
          error:
            "A análise do documento falhou devido a uma formatação inesperada.",
        };
      }

      subjects = rawSubjects
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const s = item as Record<string, unknown>;
          return {
            name:
              typeof s.name === "string"
                ? s.name.trim()
                : "Disciplina Desconhecida",
            grade:
              typeof s.grade === "string"
                ? s.grade
                : s.grade == null
                  ? null
                  : String(s.grade),
            status: typeof s.status === "string" ? s.status : "PENDENTE",
            semester:
              typeof s.semester === "string"
                ? s.semester
                : s.semester == null
                  ? null
                  : String(s.semester),
            hours:
              typeof s.hours === "number"
                ? s.hours
                : s.hours == null
                  ? null
                  : Number.parseInt(String(s.hours), 10),
          };
        });
    } catch (error) {
      console.error("Falha ao estruturar JSON do histórico com IA:", error);
      return {
        error:
          "A análise do documento falhou devido a uma formatação inesperada.",
      };
    }

    if (!subjects.length) {
      return {
        error: "Nenhuma disciplina foi identificada no histórico enviado.",
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
