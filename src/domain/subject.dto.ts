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

export interface UpdateSubjectDto {
  id: string;
  code?: string;
  name?: string;
}

export interface DeleteSubjectDto {
  id: string;
}

export interface DeleteSubjectResponse {
  success: boolean;
  error?: string;
}
