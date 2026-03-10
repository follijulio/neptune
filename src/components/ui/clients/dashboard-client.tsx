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
import MainLayout from "../main-layout";
import { Alert } from "../../shadcn-ui/alert";

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
    console.log("Easter Egg Count:", count);
    setCoount(count + 1);
  };
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
      <MainLayout>
        <section className="flex h-full w-full animate-pulse flex-col gap-10 px-10">
          <div className="flex w-full items-center justify-between">
            <div className="h-8 w-48 rounded bg-zinc-800 bg-linear-to-l" />
            <div className="h-10 w-52 rounded bg-zinc-800" />
          </div>

          <div className="grid grid-cols-3 gap-10">
            <div className="li h-48 rounded-lg border border-zinc-800 bg-zinc-900" />
            <div className="h-48 rounded-lg border border-zinc-800 bg-zinc-900" />
            <div className="h-48 rounded-lg border border-zinc-800 bg-zinc-900" />
            <div className="col-span-2 h-64 rounded-lg border border-zinc-800 bg-zinc-900" />
            <div className="h-64 rounded-lg border border-zinc-800 bg-zinc-900" />
          </div>

          <div className="flex flex-col gap-10">
            <div className="h-80 rounded-lg border border-zinc-800 bg-zinc-900" />
            <div className="h-64 rounded-lg border border-zinc-800 bg-zinc-900" />
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex h-full w-full items-center justify-center bg-black p-4 text-white">
          <Alert
            variant="destructive"
            className="flex max-w-lg border border-red-900/50 bg-red-950/50"
          >
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-red-400">
                  Erro ao Carregar Dashboard
                </h3>
                <p className="flex-wrap rounded border border-red-900/30 bg-black/30 p-3 font-mono text-sm text-zinc-400">
                  {error}
                </p>
              </div>
              <p className="text-sm text-zinc-300">
                Não foi possível carregar os dados no momento. Por favor, tente
                novamente mais tarde.
              </p>
              <p className="text-xs text-zinc-400">
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
      </MainLayout>
    );
  }

  if (!data) return null;

  return (
    <MainLayout>
      <section className="flex h-full w-full flex-col gap-10 px-10">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-2xl font-bold">
            <button
              className="clique para descobrir"
              onClick={() => easterEgg()}
            >
              Visão Geral
            </button>
          </h2>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 border-[#1A1A1A] bg-[#121212] text-white transition-all duration-300 hover:scale-105 hover:bg-[#1A1A1A] hover:invert">
                <UploadCloud className="h-4 w-4" />
                <DialogTitle className="text-sm">
                  Sincronizar Histórico
                </DialogTitle>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl border-none border-[#1A1A1A] bg-[#000000] p-0 text-white">
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

          <div className="col-span-2 h-full w-full">
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
    </MainLayout>
  );
}
