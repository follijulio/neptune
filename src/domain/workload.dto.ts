export interface CreateWorkloadDto {
  category: string;
  totalHours: number;
  completedHours: number;
  userId: string;
}

export interface WorkloadResponse {
  success: boolean;
  data?: {
    id: string;
    category: string;
    totalHours: number;
    completedHours: number;
    userId: string;
  };
  error?: string;
}

export interface UpdateWorkloadDto {
  id: string;
  category?: string;
  totalHours?: number;
  completedHours?: number;
}

export interface DeleteWorkloadDto {
  id: string;
  userId: string;
}

export interface DeleteWorkloadResponse {
  success: boolean;
  error?: string;
}
