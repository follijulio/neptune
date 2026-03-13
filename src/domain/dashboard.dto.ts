export interface DashboardFiltersDto {
  userId: string;
  semester?: string;
  filterCurriculum?: string;
}

export interface DashboardDataResponse {
  success: boolean;
  data?: {
    totalHours: number;
    completedHours: number;
    currentYieldCoefficient: number;
    previousYieldCoefficient: number;
    semestersTable: Array<{
      id: string;
      semester: string;
      status: string;
      data: Array<{
        id: string;
        subject_name: string;
        status: string;
        partial_grade: number | null;
      }>;
    }>;
    coursesAttention: Array<{
      subject_name: string;
      absences: number | null;
      maxAbsences: number | null;
    }>;
    performanceChart: Array<{
      semester: string;
      yield_coefficient: number | null;
    }>;
    workloadChart: Array<{
      hours_name: string;
      hours: number;
    }>;
    enrolledCourses: Array<{
      id: string;
      subjectId: string;
      subject_name: string;
      status: string;
      absences: number | null;
      maxAbsences: number | null;
      partial_grade: number | null;
    }>;
  };
  error?: string;
}
