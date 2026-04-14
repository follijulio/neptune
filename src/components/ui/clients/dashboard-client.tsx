"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import PdfUploader from "@/src/components/ui/pdf-uploader";

type LoadingTarget = "all" | "semester" | "curriculum";

function BentoSkeleton() {
  return (
    <section className="mx-auto flex h-full w-full max-w-screen-2xl animate-pulse flex-col gap-4 px-4 sm:gap-6 sm:px-6 lg:gap-8 lg:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-36 rounded-xl bg-zinc-800/70 sm:h-8 sm:w-48" />
        <div className="h-9 w-full max-w-52 rounded-xl bg-zinc-800/70 sm:h-10" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <div className="h-48 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 md:col-span-2" />
        <div className="h-48 rounded-2xl border border-zinc-800/50 bg-zinc-900/40" />
        <div className="h-48 rounded-2xl border border-zinc-800/50 bg-zinc-900/40" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <div className="h-72 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 md:col-span-2" />
        <div className="h-72 rounded-2xl border border-zinc-800/50 bg-zinc-900/40" />
        <div className="h-72 rounded-2xl border border-zinc-800/50 bg-zinc-900/40" />
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="h-72 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 sm:h-80" />
        <div className="h-56 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 sm:h-64" />
      </div>
    </section>
  );
}

export default function DashboardClient({
  userId,
  initialXp,
}: {
  userId: string;
  userName?: string | null;
  initialXp?: number;
}) {
  const searchParams = useSearchParams();
  const { data, isLoading, error, execute } = useDashboardData();

  const [loadingTarget, setLoadingTarget] = useState<LoadingTarget>("all");
  const [clickCount, setClickCount] = useState(1);

  const previousSemester = useRef<string | undefined>(undefined);
  const previousCurriculum = useRef<string | undefined>(undefined);

  const handleTitleClick = useCallback(() => {
    setClickCount((current) => {
      if (current % 14 === 0) {
        alert("14 o melhor número de todos!");
      }
      return current + 1;
    });
  }, []);

  useEffect(() => {
    const semester = searchParams.get("semester") || undefined;
    const filterCurriculum = searchParams.get("filterCurriculum") || undefined;

    if (semester !== previousSemester.current) {
      setLoadingTarget("semester");
    } else if (filterCurriculum !== previousCurriculum.current) {
      setLoadingTarget("curriculum");
    } else {
      setLoadingTarget("all");
    }

    previousSemester.current = semester;
    previousCurriculum.current = filterCurriculum;

    execute({ userId, semester, filterCurriculum });
  }, [searchParams, execute, userId]);

  if (isLoading && !data) {
    return (
      <section>
        <BentoSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="flex h-full w-full items-center justify-center bg-[#0A0A0A] p-4 text-white">
          <Alert
            variant="destructive"
            className="flex w-full max-w-lg rounded-2xl border border-red-900/40 bg-red-950/30 p-5 shadow-xl shadow-red-950/20 sm:p-6"
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="mb-1.5 text-base font-semibold text-red-400 sm:mb-2 sm:text-lg">
                  Erro ao carregar dashboard
                </h3>
                <p className="rounded-xl border border-red-900/30 bg-black/40 p-2 font-mono text-xs text-zinc-400 sm:p-3 sm:text-sm">
                  {error}
                </p>
              </div>
              <p className="text-xs text-zinc-300 sm:text-sm">
                Não foi possível carregar os dados no momento. Tente novamente
                mais tarde.
              </p>
              <p className="text-[10px] text-zinc-400 sm:text-xs">
                Se o problema persistir, entre em contato com o{" "}
                <a
                  href="https://github.com/follijulio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007AFF] underline underline-offset-2 transition-colors hover:text-blue-300"
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
    <section className="pb-12">
      <section className="mx-auto flex h-full w-full max-w-screen-2xl flex-col gap-4 px-4 sm:gap-6 sm:px-6 lg:gap-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            <button
              type="button"
              className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent transition-opacity outline-none hover:opacity-70"
              onClick={handleTitleClick}
            >
              Visão geral
            </button>
          </h2>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-10 w-full gap-2 rounded-xl border border-[#1A1A1A] bg-[#111111] px-4 text-white shadow-md shadow-black/40 transition-all duration-300 hover:border-[#007AFF]/30 hover:bg-[#141414] hover:shadow-[#007AFF]/10 sm:w-auto">
                <UploadCloud className="h-4 w-4 text-[#007AFF]" />
                <span className="hidden text-sm font-medium sm:inline">
                  Sincronizar Histórico
                </span>
                <span className="text-sm font-medium sm:hidden">
                  Sincronizar
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-3xl overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#080808] p-0 text-white shadow-2xl shadow-black/60">
              <PdfUploader />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          <div className="h-48 sm:h-52 md:col-span-2">
            <Cards.YieldCoefficient
              semesters={data.performanceChart}
              currentValue={data.currentYieldCoefficient}
              previousValue={data.previousYieldCoefficient}
            />
          </div>

          <div className="h-48 sm:h-52">
            <Cards.XpProgress xp={initialXp ?? 0} />
          </div>

          <div className="h-48 sm:h-52">
            <Cards.CourseProgress
              hoursCompleted={data.completedHours}
              hoursTotal={data.totalHours}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          <div className="h-64 sm:h-72 md:col-span-2">
            <Cards.AverageRating semesters_data={data.performanceChart} />
          </div>

          <div className="h-64 sm:h-72">
            <Cards.DistributionWork ChartData={data.workloadChart} />
          </div>

          <div className="h-64 sm:h-72">
            <Cards.AttentionRequired subjects={data.coursesAttention} />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
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
