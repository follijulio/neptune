export interface CreateEnrollmentDto {
  status: "APROVADO" | "REPROVADO" | "CURSANDO" | "PENDENTE";
  grade?: number | null;
  absences?: number | null;
  maxAbsences?: number | null;
  userId: string;
  subjectId: string;
  semesterId?: string | null;
}

export interface EnrollmentResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    grade: number | null;
    absences: number | null;
    maxAbsences: number | null;
    userId: string;
    subjectId: string;
    semesterId: string | null;
  };
  error?: string;
}

export interface UpdateEnrollmentDto {
  id: string;
  status?: "APROVADO" | "REPROVADO" | "CURSANDO" | "PENDENTE";
  grade?: number | null;
  absences?: number | null;
  maxAbsences?: number | null;
  semesterId?: string | null;
}

export interface DeleteEnrollmentDto {
  id: string;
}

export interface DeleteEnrollmentResponse {
  success: boolean;
  error?: string;
}
