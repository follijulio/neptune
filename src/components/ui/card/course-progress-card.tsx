"use client";

import { useMemo } from "react";
import { TbTargetArrow } from "react-icons/tb";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { ChartConfig, ChartContainer } from "../../shadcn-ui/chart";

interface CourseProgressCardProps {
  hoursTotal: number;
  hoursCompleted: number;
}

interface RadialProgressChartProps {
  progress: number;
}

const CHART_CONFIG = {
  progress: {
    label: "Progress",
  },
  primary: {
    label: "Primary",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const CHART_STYLE = {
  startAngle: 90,
  innerRadius: 60, // Adjusted for mobile
  outerRadius: 90, // Adjusted for mobile
  barSize: 20, // Adjusted for mobile
  polarRadius: [70, 58] as [number, number], // Adjusted for mobile
};

const calculateProgress = (completed: number, total: number): number => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const RadialProgressChart: React.FC<RadialProgressChartProps> = ({
  progress,
}) => {
  const chartData = useMemo(() => [{ progress, fill: "#007AFF" }], [progress]);
  const endAngle = useMemo(
    () => CHART_STYLE.startAngle - (360 * progress) / 100,
    [progress],
  );

  return (
    <ChartContainer
      config={CHART_CONFIG}
      className="mx-auto aspect-square w-full max-w-50 sm:max-w-none"
    >
      <RadialBarChart
        data={chartData}
        startAngle={CHART_STYLE.startAngle}
        endAngle={endAngle}
        innerRadius={CHART_STYLE.innerRadius}
        outerRadius={CHART_STYLE.outerRadius}
        barSize={CHART_STYLE.barSize}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-white/20 last:fill-black"
          polarRadius={CHART_STYLE.polarRadius}
        />
        <RadialBar dataKey="progress" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  />
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
};

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  hoursTotal,
  hoursCompleted,
}) => {
  const progress = useMemo(
    () => calculateProgress(hoursCompleted, hoursTotal),
    [hoursCompleted, hoursTotal],
  );

  return (
    <div className="flex h-64 w-full flex-col rounded-2xl border border-white/50 bg-transparent p-4 text-white sm:h-72 sm:rounded-3xl sm:p-5">
      <h1 className="mb-2 flex shrink-0 items-center gap-1.5 text-xs font-semibold tracking-wider text-[#888888] uppercase sm:mb-4 sm:gap-2 sm:text-sm">
        <TbTargetArrow className="inline shrink-0 text-sm sm:text-base" />
        <span className="truncate">Progresso do Curso</span>
      </h1>

      <section className="flex h-full w-full flex-row items-center justify-between gap-4 sm:gap-8">
        <div className="flex flex-col justify-center gap-2 sm:gap-4">
          <span className="text-5xl leading-none font-light sm:text-6xl">
            {progress}%
          </span>
          <span className="flex flex-col gap-0.5 text-[10px] font-medium text-[#888888] sm:flex-row sm:gap-2 sm:text-sm">
            <span>
              {hoursCompleted}/{hoursTotal}
            </span>
            <span className="hidden sm:inline">horas</span>
            <span className="sm:hidden">hrs</span>
          </span>
        </div>

        <div className="flex h-full max-h-40 flex-1 items-center justify-center sm:max-h-full">
          <RadialProgressChart progress={progress} />
        </div>
      </section>
    </div>
  );
};
