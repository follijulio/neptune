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
  progress: {
    label: "Progress",
  },
  primary: {
    label: "Primary",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ChartStyle = {
  startAngle: number;
  innerRadius: number;
  outerRadius: number;
  barSize: number;
  polarRadius: [number, number];
};

const getResponsiveChartStyle = (): ChartStyle => {
  if (typeof window === "undefined") {
    return {
      startAngle: 90,
      innerRadius: 70,
      outerRadius: 100,
      barSize: 35,
      polarRadius: [76, 64],
    };
  }

  const vw = window.innerWidth;
  const scale = Math.min(Math.max(vw / 1440, 0.65), 1); // 65% -> 100%

  const innerRadius = Math.round(70 * scale);
  const outerRadius = Math.round(100 * scale);
  const barSize = Math.round(35 * scale);

  return {
    startAngle: 90,
    innerRadius,
    outerRadius,
    barSize,
    polarRadius: [Math.round(76 * scale), Math.round(64 * scale)],
  };
};

const CHART_STYLE = getResponsiveChartStyle();

const calculateProgress = (completed: number, total: number): number => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const RadialProgressChart: React.FC<RadialProgressChartProps> = ({
  progress,
}) => {
  const chartData = [{ progress, fill: "#007AFF" }];
  const endAngle = CHART_STYLE.startAngle - (360 * progress) / 100;

  return (
    <ChartContainer config={CHART_CONFIG} className="mx-auto aspect-square">
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
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-white font-medium"
                      style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
                    >
                      {progress}%
                    </tspan>
                  </text>
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
  const progress = calculateProgress(hoursCompleted, hoursTotal);

  return (
    <div className="h-72 w-full rounded-3xl border border-white/50 bg-transparent p-4 text-white">
      <section className="flex h-full w-full flex-row justify-between gap-4">
        <div className="flex w-2/3 flex-col gap-8">
          <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
            <TbTargetArrow className="inline" /> Progresso do Curso
          </h1>
          <span className="text-6xl font-light">{progress}%</span>
          <span className="flex gap-2 text-[#888888]">
            <span>
              {hoursCompleted}/{hoursTotal}
            </span>
            horas
          </span>
        </div>
        <div className="w-1/3">
          <RadialProgressChart progress={progress} />
        </div>
      </section>
    </div>
  );
};
