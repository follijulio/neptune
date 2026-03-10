"use server";

import Groq from "groq-sdk";
import PDFParser from "pdf2json";

import { SemesterStatus, SubjectStatus } from "@/prisma/generated/prisma/enums";
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

//todo: essa função realmente precisa ser otimizada - abrir uma issue depois
export async function saveExtractedSubjectsAction(subjects: ParsedSubject[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Usuário não autenticado." };
    const userId = session.user.id;

    let totalCompletedHours = 0;
    const semesterData: Record<
      string,
      { totalScore: number; totalHours: number; status: SemesterStatus }
    > = {};

    for (const sub of subjects) {
      const subjectCode =
        sub.code?.trim() ||
        `GEN-${Buffer.from(sub.name).toString("base64").substring(0, 8).toUpperCase()}`;

      let finalStatus: SubjectStatus = "PENDENTE";
      const s = sub.status?.toUpperCase() || "";
      if (s.includes("APROV")) finalStatus = "APROVADO";
      else if (s.includes("REP")) finalStatus = "REPROVADO";
      else if (s.includes("CURS")) finalStatus = "CURSANDO";

      let finalGrade = null;
      if (sub.grade) {
        const parsed = parseFloat(sub.grade.replace(",", "."));
        if (!isNaN(parsed)) finalGrade = parsed;
      }

      const hours = sub.hours ? parseInt(String(sub.hours), 10) : 0;
      if (finalStatus === "APROVADO" && !isNaN(hours)) {
        totalCompletedHours += hours;
      }

      let semesterId = null;
      if (sub.semester) {
        const period = sub.semester.trim();

        if (!semesterData[period]) {
          semesterData[period] = {
            totalScore: 0,
            totalHours: 0,
            status: "CONCLUIDO",
          };
        }

        if (finalStatus === "CURSANDO" || finalStatus === "PENDENTE") {
          semesterData[period].status = "CURSANDO";
        }

        if (
          finalGrade !== null &&
          !isNaN(hours) &&
          hours > 0 &&
          finalStatus !== "CURSANDO"
        ) {
          semesterData[period].totalScore += finalGrade * hours;
          semesterData[period].totalHours += hours;
        }

        const semesterRecord = await prisma.semester.findFirst({
          where: { userId, period },
        });

        if (semesterRecord) {
          semesterId = semesterRecord.id;
        } else {
          const newSemester = await prisma.semester.create({
            data: { userId, period, status: "PENDENTE" },
          });
          semesterId = newSemester.id;
        }
      }

      const subject = await prisma.subject.upsert({
        where: { code: subjectCode },
        update: {},
        create: { code: subjectCode, name: sub.name.trim() },
      });

      await prisma.enrollment.create({
        data: {
          userId,
          status: finalStatus,
          grade: finalGrade,
          subjectId: subject.id,
          semesterId,
        },
      });
    }

    for (const [period, data] of Object.entries(semesterData)) {
      let cr = null;
      if (data.totalHours > 0) {
        cr = parseFloat((data.totalScore / data.totalHours).toFixed(2));
      }

      const semesterRecord = await prisma.semester.findFirst({
        where: { userId, period },
      });

      if (semesterRecord) {
        await prisma.semester.update({
          where: { id: semesterRecord.id },
          data: {
            status: data.status,
            yieldCoefficient: cr,
          },
        });
      }
    }

    if (totalCompletedHours > 0) {
      const existingWorkload = await prisma.workload.findFirst({
        where: { userId, category: "Obrigatórias" },
      });

      if (existingWorkload) {
        await prisma.workload.update({
          where: { id: existingWorkload.id },
          data: {
            completedHours:
              existingWorkload.completedHours + totalCompletedHours,
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

    return { success: true };
  } catch (error) {
    console.error("ERRO:", error);
    return { error: String(error) };
  }
}
