import { prisma } from "@/prisma/lib/prisma";
import { DashboardFiltersDto } from "@/src/domain/dashboard.dto";

type WorkloadItem = {
  category: string;
  totalHours: number;
  completedHours: number;
};

type EnrollmentWithSubject = {
  status: string;
  grade: number | null;
  absences: number | null;
  maxAbsences: number | null;
  subject: {
    name: string;
    code: string;
  };
};

type SemesterWithEnrollments = {
  period: string;
  status: string;
  yieldCoefficient: number | null;
  enrollments: EnrollmentWithSubject[];
};

export class GetDashboardDataService {
  async execute({ userId, semester, filterCurriculum }: DashboardFiltersDto) {
    const [workloads, semesters, filteredEnrollments]: [
      WorkloadItem[],
      SemesterWithEnrollments[],
      EnrollmentWithSubject[],
    ] = await Promise.all([
      prisma.workload.findMany({ where: { userId } }),

      prisma.semester.findMany({
        where: { userId },
        orderBy: { period: "asc" },
        include: {
          enrollments: { include: { subject: true } },
        },
      }),

      prisma.enrollment.findMany({
        where: {
          userId,
          ...(semester ? { semester: { period: semester } } : {}),
          ...(filterCurriculum === "pending" ? { status: "PENDENTE" } : {}),
        },
        include: { subject: true },
      }),
    ]);

    const totalHours = workloads.reduce(
      (sum, item) => sum + item.totalHours,
      0,
    );
    const completedHours = workloads.reduce(
      (sum, item) => sum + item.completedHours,
      0,
    );

    const currentYieldCoefficient =
      semesters[semesters.length - 1]?.yieldCoefficient || 0;
    const previousYieldCoefficient =
      semesters[semesters.length - 2]?.yieldCoefficient || 0;

    const semestersTable = semesters.map((sem) => ({
      semester: sem.period,
      status: sem.status,
      data: sem.enrollments.map((env) => ({
        subject_name: env.subject.name,
        code: env.subject.code,
        status: env.status,
        partial_grade: env.grade,
      })),
    }));

    const coursesAttention = filteredEnrollments.map((env) => ({
      subject_name: env.subject.name,
      absences: env.absences,
      maxAbsences: env.maxAbsences,
    }));

    const performanceChart = semesters.map((sem) => ({
      semester: sem.period,
      yield_coefficient: sem.yieldCoefficient,
    }));

    const workloadChart = workloads.map((item) => ({
      hours_name: item.category,
      hours: item.completedHours,
    }));

    const enrolledCourses = filteredEnrollments.map((env) => ({
      subject_name: env.subject.name,
      code: env.subject.code,
      status: env.status,
      absences: env.absences,
      maxAbsences: env.maxAbsences,
      partial_grade: env.grade,
    }));

    return {
      totalHours,
      completedHours,
      currentYieldCoefficient,
      previousYieldCoefficient,
      semestersTable,
      coursesAttention,
      performanceChart,
      workloadChart,
      enrolledCourses,
    };
  }
}
