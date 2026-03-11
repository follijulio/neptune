import { Prisma } from "@/prisma/generated/prisma/client";
import { prisma } from "@/prisma/lib/prisma";
import { DashboardFiltersDto } from "@/src/domain/dashboard.dto";

type SemesterWithEnrollments = Prisma.SemesterGetPayload<{
  include: {
    enrollments: {
      include: { subject: true };
    };
  };
}>;

type EnrollmentWithSubject = Prisma.EnrollmentGetPayload<{
  include: { subject: true };
}>;

type SemesterWithCR = SemesterWithEnrollments & {
  yieldCoefficient: number;
};

export class GetDashboardDataService {
  async execute({ userId, semester, filterCurriculum }: DashboardFiltersDto) {
    const [workloads, semesters, filteredEnrollments] = await Promise.all([
      prisma.workload.findMany({ where: { userId } }),

      prisma.semester.findMany({
        where: { userId },
        orderBy: { title: "asc" },
        include: {
          enrollments: { include: { subject: true } },
        },
      }),

      prisma.enrollment.findMany({
        where: {
          userId,
          ...(semester ? { semester: { title: semester } } : {}),
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

    const calculateCR = (
      enrollments: SemesterWithEnrollments["enrollments"],
    ): number => {
      let totalScore = 0;
      let totalHours = 0;

      enrollments.forEach((env) => {
        if (env.grade !== null && env.subject?.workload) {
          totalScore += env.grade * env.subject.workload;
          totalHours += env.subject.workload;
        }
      });

      return totalHours > 0 ? Number((totalScore / totalHours).toFixed(2)) : 0;
    };

    const semestersWithCR: SemesterWithCR[] = semesters.map((sem) => ({
      ...sem,
      yieldCoefficient: calculateCR(sem.enrollments),
    }));

    const currentYieldCoefficient =
      semestersWithCR[semestersWithCR.length - 1]?.yieldCoefficient || 0;
    const previousYieldCoefficient =
      semestersWithCR[semestersWithCR.length - 2]?.yieldCoefficient || 0;

    const semestersTable = semestersWithCR
      .map((sem) => {
        const filteredData = sem.enrollments.filter((env) => {
          if (!filterCurriculum || filterCurriculum === "all") return true;
          if (filterCurriculum === "completed")
            return env.status === "APROVADO";
          if (filterCurriculum === "pending")
            return ["PENDENTE", "CURSANDO", "REPROVADO"].includes(env.status);
          if (filterCurriculum === "blocked")
            return (env.status as string) === "BLOQUEADO";
          return true;
        });

        return {
          semester: sem.title,
          status:
            (sem as SemesterWithCR & { status?: string }).status || "CONCLUIDO",
          data: filteredData.map((env) => ({
            subject_name: env.subject.name,
            code:
              (env.subject as typeof env.subject & { code?: string }).code ||
              "N/A",
            status: env.status,
            partial_grade: env.grade,
          })),
        };
      })
      .filter((sem) => sem.data.length > 0);

    const coursesAttention = filteredEnrollments.map(
      (env: EnrollmentWithSubject) => ({
        subject_name: env.subject.name,
        absences: env.subject.currentAbsences || 0,
        maxAbsences: env.subject.maxAbsences || 0,
      }),
    );

    const performanceChart = semestersWithCR.map((sem) => ({
      semester: sem.title,
      yield_coefficient: sem.yieldCoefficient,
    }));

    const workloadChart = workloads.map((item) => ({
      hours_name: item.category,
      hours: item.completedHours,
    }));

    const enrolledCourses = filteredEnrollments.map(
      (env: EnrollmentWithSubject) => ({
        id: env.id,
        subjectId: env.subjectId,
        subject_name: env.subject.name,
        code:
          (env.subject as typeof env.subject & { code?: string }).code || "N/A",
        status: env.status,
        absences: env.subject.currentAbsences || 0,
        maxAbsences: env.subject.maxAbsences || 0,
        partial_grade: env.grade,
      }),
    );

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
