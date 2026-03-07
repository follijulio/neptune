"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "../components/ui/nav-bar";
import Cards from "../components/ui/card";
import Table from "../components/ui/table";
import { useDashboardData } from "../hooks/dashboard/use-dashboard-data";

function HomeContent() {
  const searchParams = useSearchParams();
  const { data, isLoading, error, execute } = useDashboardData();

  useEffect(() => {
    const semester = searchParams.get("semester") || undefined;
    const filterCurriculum = searchParams.get("filterCurriculum") || undefined;
    const userId = "coloque-o-id-do-usuario-aqui";

    execute({ userId, semester, filterCurriculum });
  }, [searchParams, execute]);

  if (isLoading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Carregando seu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-black text-white flex flex-col gap-10 overflow-scroll w-screen py-2 min-h-screen">
      <NavBar profileImageUrl={"/placeholder-avatar.png"} />

      <section className="h-full w-full px-10 gap-10 flex flex-col">
        <div className="grid grid-cols-3 gap-10">
          <Cards.YieldCoefficient
            semesters={data.performanceChart}
            currentValue={data.currentYieldCoefficient}
            previousValue={data.previousYieldCoefficient}
          />

          <Cards.CourseProgress
            hoursCompleted={data.completedHours}
            hoursTotal={data.totalHours}
          />

          <Cards.AttentionRequired subjects={data.coursesAttention} />

          <div className="w-full h-full col-span-2">
            <Cards.AverageRating semesters_data={data.performanceChart} />
          </div>

          <Cards.DistributionWork ChartData={data.workloadChart} />
        </div>

        <div className="flex flex-col gap-10">
          <Table.CourseStatus courses={data.enrolledCourses} />
          <Table.Semester data={data.semestersTable} />
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
