"use client";

import { useEffect, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Cookies from "js-cookie";
import {
  Eye,
  EyeOff,
  GripVertical,
  Settings,
  Timer,
  UploadCloud,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useDashboardData } from "../../../hooks/dashboard/use-dashboard-data";
import { Alert } from "../../shadcn-ui/alert";
import Cards from "../card";
import Table from "../table";

import PomodoroClient from "./pomodoro-client";

import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import PdfUploader from "@/src/components/ui/pdf-uploader";

type LoadingTarget = "all" | "semester" | "curriculum";

const COOKIE_KEY = "dashboard_layout_config";

const DEFAULT_LAYOUT = [
  { id: "metrics", title: "Métricas Principais (Gráficos)", visible: true },
  { id: "courseStatus", title: "Status das Disciplinas", visible: true },
  { id: "semester", title: "Tabela de Semestres", visible: true },
];

function BentoSkeleton() {
  return (
    <section className="mx-auto flex h-full w-full max-w-screen-2xl animate-pulse flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-36 rounded-xl bg-zinc-800/70 sm:h-8 sm:w-48" />
        <div className="h-9 w-full max-w-52 rounded-xl bg-zinc-800/70 sm:h-10" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <div className="h-48 rounded-xl border border-zinc-800/50 bg-zinc-900/40 md:col-span-2" />
        <div className="h-48 rounded-xl border border-zinc-800/50 bg-zinc-900/40 md:col-span-2" />
      </div>
    </section>
  );
}

function SortableNavItem({
  item,
  toggleVisibility,
}: {
  item: {
    id: string;
    title: string;
    visible: boolean;
  };
  toggleVisibility: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between rounded-xl border p-3 shadow-sm transition-all ${
        isDragging
          ? "scale-[1.02] cursor-grabbing border-[#007AFF] bg-[#007AFF]/10 shadow-lg shadow-[#007AFF]/5"
          : "border-[#1A1A1A] bg-[#111111] hover:border-zinc-800"
      } ${!item.visible && !isDragging ? "opacity-50 grayscale" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="flex cursor-grab items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-white active:cursor-grabbing"
          title="Segure e arraste para reordenar"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{item.title}</span>
          <span className="text-[10px] font-medium text-zinc-500">
            {item.visible ? "Visível no dashboard" : "Oculto no momento"}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleVisibility(item.id)}
        className={`h-9 w-9 rounded-lg p-0 transition-colors ${
          item.visible
            ? "text-[#007AFF] hover:bg-[#007AFF]/20 hover:text-[#007AFF]"
            : "text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
        }`}
      >
        {item.visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default function DashboardClient({
  userId,
}: {
  userId: string;
  userName?: string | null;
}) {
  const searchParams = useSearchParams();
  const { data, isLoading, error, execute } = useDashboardData();

  const [loadingTarget, setLoadingTarget] = useState<LoadingTarget>("all");
  const previousSemester = useRef<string | undefined>(undefined);
  const previousCurriculum = useRef<string | undefined>(undefined);

  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const savedLayout = Cookies.get(COOKIE_KEY);
    if (savedLayout) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLayout(JSON.parse(savedLayout));
      } catch {
        setLayout(DEFAULT_LAYOUT);
      }
    }
  }, []);

  useEffect(() => {
    const semester = searchParams.get("semester") || undefined;
    const filterCurriculum = searchParams.get("filterCurriculum") || undefined;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (semester !== previousSemester.current) setLoadingTarget("semester");
    else if (filterCurriculum !== previousCurriculum.current)
      setLoadingTarget("curriculum");
    else setLoadingTarget("all");

    previousSemester.current = semester;
    previousCurriculum.current = filterCurriculum;

    execute({ userId, semester, filterCurriculum });
  }, [searchParams, execute, userId]);

  const saveLayout = (newLayout: typeof layout) => {
    setLayout(newLayout);
    Cookies.set(COOKIE_KEY, JSON.stringify(newLayout));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = layout.findIndex((item) => item.id === active.id);
      const newIndex = layout.findIndex((item) => item.id === over?.id);
      saveLayout(arrayMove(layout, oldIndex, newIndex));
    }
  };

  const toggleVisibility = (id: string) => {
    const newLayout = layout.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item,
    );
    saveLayout(newLayout);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading && !data)
    return (
      <section>
        <BentoSkeleton />
      </section>
    );
  if (error)
    return (
      <section>
        <div className="flex h-full w-full items-center justify-center bg-[#0A0A0A] p-4 text-white">
          <Alert
            variant="destructive"
            className="flex w-full max-w-lg rounded-xl border border-red-900/40 bg-red-950/30 p-5 shadow-xl"
          >
            <div className="space-y-3 sm:space-y-4">
              <h3 className="mb-1.5 text-base font-semibold text-red-400">
                Erro ao carregar dashboard
              </h3>
              <p className="rounded-xl border border-red-900/30 bg-black/40 p-2 font-mono text-xs text-zinc-400">
                {error}
              </p>
            </div>
          </Alert>
        </div>
      </section>
    );

  if (!data) return null;

  const renderWidget = (id: string) => {
    switch (id) {
      case "metrics":
        return (
          <div
            key={id}
            className="col-span-1 flex flex-col gap-4 md:col-span-2 xl:col-span-4 xl:gap-5"
          >
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              <div className="h-60 sm:h-64 md:col-span-2">
                <Cards.YieldCoefficient
                  semesters={data.performanceChart}
                  currentValue={data.currentYieldCoefficient}
                  previousValue={data.previousYieldCoefficient}
                />
              </div>
              <div className="h-60 sm:h-64 md:col-span-2">
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
          </div>
        );
      case "courseStatus":
        return (
          <div key={id} className="col-span-1 md:col-span-2 xl:col-span-4">
            <Table.CourseStatus
              courses={data.enrolledCourses.map((c) => ({
                ...c,
                subjectId: c.subjectId,
              }))}
              isLoading={isLoading && loadingTarget === "semester"}
            />
          </div>
        );
      case "semester":
        return (
          <div key={id} className="col-span-1 md:col-span-2 xl:col-span-4">
            <Table.Semester
              data={data.semestersTable}
              isLoading={isLoading && loadingTarget === "curriculum"}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="pb-12">
      <section className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Visão geral
          </h2>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="h-10 rounded-xl border border-[#1A1A1A] bg-[#111111] p-2 text-zinc-400 transition-all hover:border-[#007AFF]/30 hover:text-white"
                  title="Abrir Pomodoro"
                >
                  <section className="flex items-center gap-2 text-sm font-semibold tracking-wider">
                    <Timer className="h-5 w-5 shrink-0" />
                    <span className="">Pomodoro</span>
                  </section>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg overflow-hidden border-none p-0 shadow-none">
                <DialogTitle className="sr-only">Timer Pomodoro</DialogTitle>

                <div className="h-[85vh] max-h-full w-full overflow-hidden border border-[#1A1A1A] shadow-2xl">
                  <PomodoroClient />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-10 w-full gap-2 rounded-xl border border-[#1A1A1A] bg-[#111111] p-2 px-4 text-zinc-400 transition-all hover:border-[#007AFF]/30 hover:text-white sm:w-auto">
                  <section className="flex items-center gap-2 text-sm font-semibold tracking-wider">
                    <UploadCloud className="shrink-0" />
                    <span className="">Sincronizar Histórico</span>
                    <span className="sm:hidden">Sincronizar</span>
                  </section>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-3xl rounded-xl border border-[#1A1A1A] bg-[#080808] px-2 text-white">
                <DialogTitle>
                  <p className="bg-linear-to-r from-white to-zinc-400 bg-clip-text text-center text-lg font-bold text-transparent">
                    Sincronizar Histórico Acadêmico
                  </p>
                </DialogTitle>
                <PdfUploader />
              </DialogContent>
            </Dialog>
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button
                  title="Configurações da página"
                  className="h-10 rounded-xl border border-[#1A1A1A] bg-[#111111] p-2 text-zinc-400 transition-all hover:border-[#007AFF]/30 hover:text-white"
                >
                  <section className="flex items-center gap-2 text-sm font-semibold tracking-wider">
                    <Settings className="shrink-0" />
                    <span className="">Layout</span>
                  </section>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md rounded-xl border border-[#1A1A1A] bg-[#080808] text-white">
                <DialogTitle className="mb-4 text-lg font-bold">
                  Personalizar Layout
                </DialogTitle>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={layout}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {layout.map((item) => (
                        <SortableNavItem
                          key={item.id}
                          item={item}
                          toggleVisibility={toggleVisibility}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => setIsConfigOpen(false)}
                    className="bg-[#007AFF] text-white hover:bg-[#005bb5]"
                  >
                    Concluído
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {layout
            .filter((item) => item.visible)
            .map((item) => renderWidget(item.id))}
        </div>
      </section>
    </section>
  );
}
