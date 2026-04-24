import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

type JsonValue = Record<string, unknown> | unknown[];

type TaskType =
  | "pdf_question_extraction"
  | "answer_evaluation_text"
  | "answer_evaluation_multimodal"
  | "boss_generation"
  | "history_structuring";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_RETRIES = 2;
const TASK_TIMEOUT_MS: Record<TaskType, number> = {
  pdf_question_extraction: 60 * 1000, // 60 seg
  answer_evaluation_multimodal: 30 * 1000, // 30 seg
  answer_evaluation_text: 20 * 1000, // 20 seg
  boss_generation: 20 * 1000, // 20 seg
  history_structuring: 25 * 1000, // 25 seg
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout da requisição de IA")), ms),
    ),
  ]);
}

function stripJsonFence(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function parseJsonStrict<T = JsonValue>(text: string): T {
  const cleaned = stripJsonFence(text);
  return JSON.parse(cleaned) as T;
}

async function retry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastError;
}

export async function generateJsonByTask<T = JsonValue>({
  task,
  prompt,
  pdfBase64,
  imageBase64,
  imageMimeType = "image/jpeg",
}: {
  task: TaskType;
  prompt: string;
  pdfBase64?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<T> {
  const needsMultimodal =
    task === "pdf_question_extraction" ||
    task === "answer_evaluation_multimodal" ||
    Boolean(pdfBase64) ||
    Boolean(imageBase64);

  if (needsMultimodal) {
    return retry(async () => {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [prompt];
      if (pdfBase64) {
        parts.push({
          inlineData: { data: pdfBase64, mimeType: "application/pdf" },
        });
      }
      if (imageBase64) {
        parts.push({
          inlineData: { data: imageBase64, mimeType: imageMimeType },
        });
      }

      const result = await withTimeout(
        model.generateContent(parts),
        TASK_TIMEOUT_MS[task],
      );
      return parseJsonStrict<T>(result.response.text());
    });
  }

  try {
    return await retry(async () => {
      const completion = await withTimeout(
        groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "Responda estritamente em JSON válido.",
            },
            { role: "user", content: prompt },
          ],
        }),
        TASK_TIMEOUT_MS[task],
      );

      const content = completion.choices[0]?.message?.content ?? "{}";
      return parseJsonStrict<T>(content);
    });
  } catch {
    return retry(async () => {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await withTimeout(
        model.generateContent([prompt]),
        TASK_TIMEOUT_MS[task],
      );
      return parseJsonStrict<T>(result.response.text());
    });
  }
}
