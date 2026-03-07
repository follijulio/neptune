export interface CreateSubjectDto {
  code: string;
  name: string;
}

export interface SubjectResponse {
  success: boolean;
  data?: {
    id: string;
    code: string;
    name: string;
  };
  error?: string;
}