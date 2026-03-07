export interface CreateSemesterDto {
  period: string;
  status: "CONCLUIDO" | "CURSANDO" | "PENDENTE";
  yieldCoefficient?: number | null;
  userId: string;
}

export interface SemesterResponse {
  success: boolean;
  data?: {
    id: string;
    period: string;
    status: string;
    yieldCoefficient: number | null;
    userId: string;
  };
  error?: string;
}
export interface UpdateSemesterDto {
  id: string;
  period?: string;
  status?: "CONCLUIDO" | "CURSANDO" | "PENDENTE";
  yieldCoefficient?: number | null;
}

export interface DeleteSemesterDto {
  id: string;
}

export interface DeleteSemesterResponse {
  success: boolean;
  error?: string;
}
