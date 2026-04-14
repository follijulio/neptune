"use client";

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
  progress: { label: "Progress" },
  primary: { label: "Primary", color: "var(--chart-2)" },
} satisfies ChartConfig;

const CHART_STYLE = {
  startAngle: 90,
  innerRadius: 28,
  outerRadius: 42,
  barSize: 14,
  polarRadius: [32, 26] as [number, number],
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const calculateProgress = (completed: number, total: number): number => {
  if (total <= 0) return 0;
  return clamp(Math.round((completed / total) * 100), 0, 100);
};

const RadialProgressChart: React.FC<RadialProgressChartProps> = ({
  progress,
}) => {
  const chartData = [{ progress, fill: "#007AFF" }];
  const endAngle = CHART_STYLE.startAngle - (360 * progress) / 100;

  return (
    <ChartContainer config={CHART_CONFIG} className="h-full w-full">
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
          className="first:fill-white/10 last:fill-[#0A0A0A]"
          polarRadius={CHART_STYLE.polarRadius}
        />
        <RadialBar dataKey="progress" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                return null;

              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-white"
                    style={{ fontSize: "0.7rem", fontWeight: 600 }}
                  >
                    {progress}%
                  </tspan>
                </text>
              );
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
  const progress = calculateProgress(hoursCompleted, hoursTotal);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 text-white shadow-lg sm:p-5 lg:p-6">
      <header className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        <TbTargetArrow className="shrink-0" />
        <span>Progresso do Curso</span>
      </header>

      <div className="mt-4 flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <span className="block text-4xl leading-none font-light tabular-nums sm:text-5xl lg:text-6xl">
            {progress}%
          </span>
          <span className="mt-2 block text-xs text-zinc-500 sm:text-sm">
            {hoursCompleted}/{hoursTotal}&nbsp;horas
          </span>
        </div>

        <div className="mx-auto h-20 w-20 shrink-0 sm:mx-0 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
          <RadialProgressChart progress={progress} />
        </div>
      </div>
    </div>
  );
};
