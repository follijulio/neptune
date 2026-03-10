"use server";

import Groq from "groq-sdk";
import PDFParser from "pdf2json";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ParsedSubject {
  code?: string;
  name: string;
  grade?: string;
  status: string;
  semester?: string;
  hours?: number;
}

export async function parseAcademicHistoryAction(formData: FormData) {
  try {
    const file = formData.get("pdfFile") as File;

    if (!file || file.type !== "application/pdf") {
      return { error: "Por favor, envie um arquivo PDF válido." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataError", (errData) =>
        reject(errData instanceof Error ? errData : new Error(String(errData))),
      );
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    //! dá pra tirar mais infos do histórico, mas precisa ser testado a posteriori.
    const prompt = `
      Você é um assistente especializado em extrair dados de históricos escolares brasileiros.
      Analise o texto abaixo, que foi extraído de um PDF de histórico escolar, e encontre as disciplinas cursadas.
      Retorne ESTRITAMENTE um array JSON contendo objetos com as seguintes chaves:
      - "code": código da disciplina (se houver, ex: MAT001). Se não houver, deixe como null.
      - "name": nome da disciplina (ex: Matemática, Português, Cálculo 1).
      - "grade": a nota final em formato de string (ex: "8.5", "10", "A"). Se não houver, deixe como null.
      - "status": a situação (ex: APROVADO, REPROVADO, CURSANDO, TRANSFERIDO).
      - "semester": o semestre ou período letivo (ex: "2023.1", "2024.2", "1º Ano"). Se não houver, deixe como null.
      - "hours": a carga horária da disciplina. Apenas o número inteiro (ex: 60, 90). Se não houver, deixe como null.

      Regra de ouro: Retorne APENAS o JSON válido. Nenhuma palavra antes, nenhuma palavra depois. Sem formatação markdown (não use \`\`\`json).

      Texto do histórico:
      ${rawText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "[]";

    const cleanJson = responseText
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();

    const subjects = JSON.parse(cleanJson);

    return { success: true, subjects };
  } catch (error) {
    console.error("Erro no processamento limpo do PDF:", error);
    return { error: "Falha ao analisar o documento. Tente novamente." };
  }
}

type SubjectStatus = "PENDENTE" | "APROVADO" | "REPROVADO" | "CURSANDO";
type SemesterStatus = "CONCLUIDO" | "CURSANDO";

interface SemesterData {
  totalScore: number;
  totalHours: number;
  status: SemesterStatus;
}

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function saveExtractedSubjectsAction(
  subjects: ParsedSubject[],
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) return { error: "Usuário não autenticado." };

    const { totalCompletedHours} = await processSubjects(
      subjects,
      userId,
    );

    await updateWorkload(userId, totalCompletedHours);

    return { success: true };
  } catch (error) {
    console.error("ERRO:", error);
    return { error: String(error) };
  }
}

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

async function processSubjects(
  subjects: ParsedSubject[],
  userId: string,
): Promise<{
  totalCompletedHours: number;
  semesterDataMap: Record<string, SemesterData>;
}> {
  let totalCompletedHours = 0;
  const semesterDataMap: Record<string, SemesterData> = {};

  for (const subject of subjects) {
    const status = parseSubjectStatus(subject.status);
    const grade = parseGrade(subject.grade);
    const hours = parseHours(subject.hours);

    if (status === "APROVADO" && hours > 0) {
      totalCompletedHours += hours;
    }

    const semesterId = await handleSemester(
      subject.semester,
      userId,
      semesterDataMap,
      status,
      grade,
      hours,
    );

    const subjectRecord = await findOrCreateSubject(
      subject.name.trim(),
      hours,
      semesterId,
    );

    await createEnrollment(userId, status, grade, subjectRecord.id, semesterId);
  }

  return { totalCompletedHours, semesterDataMap };
}

function parseSubjectStatus(status?: string): SubjectStatus {
  const normalized = status?.toUpperCase() || "";

  if (normalized.includes("APROV")) return "APROVADO";
  if (normalized.includes("REP")) return "REPROVADO";
  if (normalized.includes("CURS")) return "CURSANDO";

  return "PENDENTE";
}

function parseGrade(grade?: string): number | null {
  if (!grade) return null;

  const parsed = parseFloat(grade.replace(",", "."));
  return isNaN(parsed) ? null : parsed;
}

function parseHours(hours?: number | string): number {
  if (!hours) return 60;

  const parsed = parseInt(String(hours), 10);
  return isNaN(parsed) ? 60 : parsed;
}

async function handleSemester(
  semester: string | undefined,
  userId: string,
  semesterDataMap: Record<string, SemesterData>,
  status: SubjectStatus,
  grade: number | null,
  hours: number,
): Promise<string | null> {
  if (!semester) return null;

  const period = semester.trim();

  updateSemesterData(semesterDataMap, period, status, grade, hours);

  return await findOrCreateSemester(userId, period);
}

function updateSemesterData(
  semesterDataMap: Record<string, SemesterData>,
  period: string,
  status: SubjectStatus,
  grade: number | null,
  hours: number,
): void {
  if (!semesterDataMap[period]) {
    semesterDataMap[period] = {
      totalScore: 0,
      totalHours: 0,
      status: "CONCLUIDO",
    };
  }

  if (status === "CURSANDO" || status === "PENDENTE") {
    semesterDataMap[period].status = "CURSANDO";
  }

  if (grade !== null && hours > 0 && status !== "CURSANDO") {
    semesterDataMap[period].totalScore += grade * hours;
    semesterDataMap[period].totalHours += hours;
  }
}

async function findOrCreateSemester(
  userId: string,
  period: string,
): Promise<string> {
  const existingSemester = await prisma.semester.findFirst({
    where: { userId, title: period },
  });

  if (existingSemester) {
    return existingSemester.id;
  }

  const newSemester = await prisma.semester.create({
    data: { userId, title: period },
  });

  return newSemester.id;
}

async function findOrCreateSubject(
  name: string,
  hours: number,
  semesterId: string | null,
) {
  const existingSubject = await prisma.subject.findFirst({
    where: {
      name,
      semesterId: semesterId as string,
    },
  });

  if (existingSubject) {
    return existingSubject;
  }

  return await prisma.subject.create({
    data: {
      name,
      workload: hours,
      maxAbsences: Math.floor(hours * 0.25),
      semesterId: semesterId as string,
    },
  });
}

async function createEnrollment(
  userId: string,
  status: SubjectStatus,
  grade: number | null,
  subjectId: string,
  semesterId: string | null,
): Promise<void> {
  await prisma.enrollment.create({
    data: {
      userId,
      status,
      grade,
      subjectId,
      semesterId: semesterId as string,
    },
  });
}

async function updateWorkload(
  userId: string,
  totalCompletedHours: number,
): Promise<void> {
  if (totalCompletedHours <= 0) return;

  const existingWorkload = await prisma.workload.findFirst({
    where: { userId, category: "Obrigatórias" },
  });

  if (existingWorkload) {
    await prisma.workload.update({
      where: { id: existingWorkload.id },
      data: {
        completedHours: existingWorkload.completedHours + totalCompletedHours,
      },
    });
  } else {
    await prisma.workload.create({
      data: {
        userId,
        category: "Obrigatórias",
        totalHours: 3200,
        completedHours: totalCompletedHours,
      },
    });
  }
}
