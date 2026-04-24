export type ActiveTab = "training" | "boss";

export type Question = {
  id: string;
  fullText: string;
  keyTopics: string[];
  providedData?: string[];
};

export type DocumentHistory = {
  id: string;
  title: string;
  createdAt: Date;
  questions: Question[];
};

export type Feedback = {
  isFullyCorrect: boolean;
  logicalScore: number;
  aiFeedback: string;
  difficultyTags: string[];
};
