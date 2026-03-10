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

    for (let i = 0; i < subjects.length; i++) {
      const sub = subjects[i];
      console.log(`Processando disciplina ${i + 1}/${subjects.length}:`, sub);
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

      const hours = sub.hours ? parseInt(String(sub.hours), 10) : 60; // Padrão 60h se o PDF falhar
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
          where: { userId, title: period },
        });

        if (semesterRecord) {
          semesterId = semesterRecord.id;
        } else {
          const newSemester = await prisma.semester.create({
            data: { userId, title: period },
          });
          semesterId = newSemester.id;
        }
      }

      // CORREÇÃO 3: Buscar pelo NOME em vez de tentar usar upsert com CODE
      let subject = await prisma.subject.findFirst({
        where: {
          name: sub.name.trim(),
          semesterId: semesterId as string,
        },
      });

      // Se a disciplina ainda não existe neste semestre, nós a criamos!
      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            name: sub.name.trim(),
            workload: hours,
            maxAbsences: Math.floor(hours * 0.25),
            semesterId: semesterId as string,
          },
        });
      }

      // Mantemos a criação na tabela Enrollment (pois o seu banco de dados atual a utiliza)
      await prisma.enrollment.create({
        data: {
          userId,
          status: finalStatus,
          grade: finalGrade,
          subjectId: subject.id,
          semesterId: semesterId as string,
        },
      });
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
