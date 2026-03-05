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

const CHART_STYLE = {
  startAngle: 90,
  innerRadius: 80,
  outerRadius: 110,
  barSize: 30,
  polarRadius: [86, 74] as [number, number],
};

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
                      className="fill-white text-4xl font-medium"
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
    <div className="w-full h-72 p-4 rounded-3xl border border-white/50 bg-transparent text-white">
      <section className="w-full flex flex-row gap-4 h-full justify-between">
        <div className="flex flex-col gap-8 w-2/3">
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
