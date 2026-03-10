/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/prisma/lib/prisma";
import { DashboardFiltersDto } from "@/src/domain/dashboard.dto";

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
      (sum: number, item: any) => sum + item.totalHours,
      0,
    );
    const completedHours = workloads.reduce(
      (sum: number, item: any) => sum + item.completedHours,
      0,
    );

    const calculateCR = (enrollments: any[]) => {
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

    const semestersWithCR = semesters.map((sem) => ({
      ...sem,
      yieldCoefficient: calculateCR(sem.enrollments),
    }));

    const currentYieldCoefficient =
      semestersWithCR[semestersWithCR.length - 1]?.yieldCoefficient || 0;
    const previousYieldCoefficient =
      semestersWithCR[semestersWithCR.length - 2]?.yieldCoefficient || 0;

    const semestersTable = semestersWithCR
      .map((sem: any) => {
        const filteredData = sem.enrollments.filter((env: any) => {
          if (!filterCurriculum || filterCurriculum === "all") return true;
          if (filterCurriculum === "completed")
            return env.status === "APROVADO";
          if (filterCurriculum === "pending")
            return ["PENDENTE", "CURSANDO", "REPROVADO"].includes(env.status);
          if (filterCurriculum === "blocked") return env.status === "BLOQUEADO";
          return true;
        });

        return {
          semester: sem.title,
          status: sem.status || "CONCLUIDO",
          data: filteredData.map((env: any) => ({
            subject_name: env.subject.name,
            code: env.subject.code || "N/A",
            status: env.status,
            partial_grade: env.grade,
          })),
        };
      })
      .filter((sem: any) => sem.data.length > 0);

    const coursesAttention = filteredEnrollments.map((env: any) => ({
      subject_name: env.subject.name,
      absences: env.subject.currentAbsences || 0,
      maxAbsences: env.subject.maxAbsences || 0,
    }));

    const performanceChart = semestersWithCR.map((sem: any) => ({
      semester: sem.title,
      yield_coefficient: sem.yieldCoefficient,
    }));

    const workloadChart = workloads.map((item: any) => ({
      hours_name: item.category,
      hours: item.completedHours,
    }));

    const enrolledCourses = filteredEnrollments.map((env: any) => ({
      id: env.id,
      subjectId: env.subjectId,
      subject_name: env.subject.name,
      code: env.subject.code || "N/A",
      status: env.status,
      absences: env.subject.currentAbsences || 0,
      maxAbsences: env.subject.maxAbsences || 0,
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
