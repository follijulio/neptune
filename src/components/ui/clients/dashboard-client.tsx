"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useDashboardData } from "../../../hooks/dashboard/use-dashboard-data";
import { Alert } from "../../shadcn-ui/alert";
import Cards from "../card";
import Table from "../table";

import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import PdfUploader from "@/src/components/ui/pdf-uploader";

export default function DashboardClient({
  userId,
}: {
  userId: string;
  userName?: string | null;
}) {
  const searchParams = useSearchParams();
  const { data, isLoading, error, execute } = useDashboardData();

  const [loadingTarget, setLoadingTarget] = useState<
    "all" | "semester" | "curriculum"
  >("all");
  const [count, setCoount] = useState(1);

  const prevSemester = useRef<string | undefined>(undefined);
  const prevCurriculum = useRef<string | undefined>(undefined);

  const easterEgg = () => {
    if (count % 14 == 0) {
      alert("14 o melhor número de todos!");
    }
    setCoount(count + 1);
  };

  useEffect(() => {
    const semester = searchParams.get("semester") || undefined;
    const filterCurriculum = searchParams.get("filterCurriculum") || undefined;

    if (semester !== prevSemester.current) {
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
      <section>
        <section className="flex h-full w-full animate-pulse flex-col gap-6 px-4 sm:gap-10 sm:px-10">
          <div className="flex w-full items-center justify-between">
            <div className="h-6 w-32 rounded bg-zinc-800 bg-linear-to-l sm:h-8 sm:w-48" />
            <div className="h-8 w-40 rounded bg-zinc-800 sm:h-10 sm:w-52" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-40 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-48" />
            <div className="h-40 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-48" />
            <div className="h-40 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-48" />
            <div className="col-span-1 h-56 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-64 md:col-span-2" />
            <div className="h-56 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-64" />
          </div>

          <div className="flex flex-col gap-6 sm:gap-10">
            <div className="h-64 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-80" />
            <div className="h-56 rounded-lg border border-zinc-800 bg-zinc-900 sm:h-64" />
          </div>
        </section>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="flex h-full w-full items-center justify-center bg-black p-4 text-white">
          <Alert
            variant="destructive"
            className="flex max-w-lg border border-red-900/50 bg-red-950/50 p-4 sm:p-6"
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="mb-1.5 text-base font-semibold text-red-400 sm:mb-2 sm:text-lg">
                  Erro ao Carregar Dashboard
                </h3>
                <p className="flex-wrap rounded border border-red-900/30 bg-black/30 p-2 font-mono text-xs text-zinc-400 sm:p-3 sm:text-sm">
                  {error}
                </p>
              </div>
              <p className="text-xs text-zinc-300 sm:text-sm">
                Não foi possível carregar os dados no momento. Por favor, tente
                novamente mais tarde.
              </p>
              <p className="text-[10px] text-zinc-400 sm:text-xs">
                Se o problema persistir, entre em contato com o{" "}
                <a
                  href="https://github.com/follijulio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline transition-colors hover:text-blue-300"
                >
                  suporte técnico
                </a>
                .
              </p>
            </div>
          </Alert>
        </div>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="pb-8">
      <section className="flex h-full w-full flex-col gap-6 px-4 sm:gap-10 sm:px-10">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">
            <button
              className="transition-opacity outline-none hover:opacity-80"
              onClick={() => easterEgg()}
            >
              Visão Geral
            </button>
          </h2>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-9 gap-2 border-[#1A1A1A] bg-[#121212] px-3 text-white transition-all duration-300 hover:scale-105 hover:bg-[#1A1A1A] hover:invert sm:h-10 sm:px-4">
                <UploadCloud className="h-4 w-4" />
                <DialogTitle className="hidden text-xs sm:block sm:text-sm">
                  Sincronizar Histórico
                </DialogTitle>
                <DialogTitle className="text-xs sm:hidden">
                  Sincronizar
                </DialogTitle>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-3xl overflow-hidden rounded-xl border-none border-[#1A1A1A] bg-[#000000] p-0 text-white">
              <PdfUploader />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
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

          <div className="col-span-1 h-full w-full md:col-span-2">
            <Cards.AverageRating semesters_data={data.performanceChart} />
          </div>

          <Cards.DistributionWork ChartData={data.workloadChart} />
        </div>

        <div className="flex flex-col gap-6 sm:gap-10">
          <Table.CourseStatus
            courses={data.enrolledCourses.map((course) => ({
              ...course,
              subjectId: course.subjectId,
            }))}
            isLoading={isLoading && loadingTarget === "semester"}
          />

          <Table.Semester
            data={data.semestersTable}
            isLoading={isLoading && loadingTarget === "curriculum"}
          />
        </div>
      </section>
    </section>
  );
}
