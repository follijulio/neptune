/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/prisma/lib/prisma";
import { DashboardFiltersDto } from "@/src/domain/dashboard.dto";

export class GetDashboardDataService {
  async execute({ userId, semester, filterCurriculum }: DashboardFiltersDto) {
    const [workloads, semesters, filteredEnrollments] = await Promise.all([
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

    const currentYieldCoefficient =
      semesters[semesters.length - 1]?.yieldCoefficient || 0;
    const previousYieldCoefficient =
      semesters[semesters.length - 2]?.yieldCoefficient || 0;

    const semestersTable = semesters
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
          semester: sem.period,
          status: sem.status,
          data: filteredData.map((env: any) => ({
            subject_name: env.subject.name,
            code: env.subject.code,
            status: env.status,
            partial_grade: env.grade,
          })),
        };
      })
      .filter((sem: any) => sem.data.length > 0);

    const coursesAttention = filteredEnrollments.map((env: any) => ({
      subject_name: env.subject.name,
      absences: env.absences,
      maxAbsences: env.maxAbsences,
    }));

    const performanceChart = semesters.map((sem: any) => ({
      semester: sem.period,
      yield_coefficient: sem.yieldCoefficient,
    }));

    const workloadChart = workloads.map((item: any) => ({
      hours_name: item.category,
      hours: item.completedHours,
    }));

    const enrolledCourses = filteredEnrollments.map((env) => ({
      id: env.id,
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
