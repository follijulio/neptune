"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "../nav-bar";
import Cards from "../card";
import Table from "../table";
import { useDashboardData } from "../../../hooks/dashboard/use-dashboard-data";
import PdfUploader from "@/src/components/ui/pdf-uploader";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/src/components/shadcn-ui/dialog";
import { UploadCloud } from "lucide-react";
import { Button } from "@/src/components/shadcn-ui/button";

export default function DashboardClient({
  userId,
  userName,
}: {
  userId: string;
  userName?: string | null;
}) {
  const searchParams = useSearchParams();
  const { data, isLoading, error, execute } = useDashboardData();

  const [loadingTarget, setLoadingTarget] = useState<
    "all" | "semester" | "curriculum"
  >("all");

  const prevSemester = useRef<string | undefined>(undefined);
  const prevCurriculum = useRef<string | undefined>(undefined);

  useEffect(() => {
    const semester = searchParams.get("semester") || undefined;
    const filterCurriculum = searchParams.get("filterCurriculum") || undefined;

    if (semester !== prevSemester.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingTarget("semester");
    } else if (filterCurriculum !== prevCurriculum.current) {
      setLoadingTarget("curriculum");
    } else {
      setLoadingTarget("all");
    }

    prevSemester.current = semester;
    prevCurriculum.current = filterCurriculum;

    execute({ userId, semester, filterCurriculum });
  }, [searchParams, execute, userId]);

  if (isLoading && !data) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            Preparando seu dashboard, {userName || "usuário"} 👋
          </p>
          <p className="text-sm text-zinc-400 animate-pulse">
            Isso leva só alguns segundos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-[#FF3B30]">Erro: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-black text-white flex flex-col gap-10 w-screen py-2 min-h-screen">
      <NavBar profileImageUrl={"/placeholder-avatar.png"} />

      <section className="h-full w-full px-10 gap-10 flex flex-col">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-2xl font-bold">Visão Geral</h2>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#121212] border-[#1A1A1A] hover:bg-[#1A1A1A] text-white hover:invert transition-all duration-300 hover:scale-105">
                <UploadCloud className="h-4 w-4" />
                <DialogTitle className="text-sm">
                  Sincronizar Histórico
                </DialogTitle>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#000000] border-[#1A1A1A] text-white max-w-3xl p-0 border-none">
              <PdfUploader />
            </DialogContent>
          </Dialog>
        </div>
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
          <Table.CourseStatus
            courses={data.enrolledCourses}
            isLoading={isLoading && loadingTarget === "semester"}
          />

          <Table.Semester
            data={data.semestersTable}
            isLoading={isLoading && loadingTarget === "curriculum"}
          />
        </div>
        <PdfUploader />
      </section>
    </div>
  );
}
