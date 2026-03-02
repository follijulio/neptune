"use client";

import { TbTargetArrow } from "react-icons/tb";
interface CourseProgressCardProps {
  hoursTotal: number;
  hoursCompleted: number;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  hoursTotal,
  hoursCompleted,
}) => {
  const percentage =
    hoursTotal > 0 ? Math.round((hoursCompleted / hoursTotal) * 100) : 0;
  return (
    <div className="w-full h-72 p-4 rounded-3xl border border-white/50 bg-transparent text-white">
      <section className="w-full flex flex-row gap-4 h-full justify-between">
        <div className="flex flex-col gap-8 w-2/3">
          <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
            <TbTargetArrow className="inline" /> Progresso do Curso
          </h1>
          <span className="text-6xl font-light">
            {percentage}
            {"%"}
          </span>
          <span className="flex gap-2 text-[#888888]">
            <span>
              {hoursCompleted}/{hoursTotal}
            </span>
            horas
          </span>
        </div>
        <div className="w-1/3">
          <ChartRadialText percentage={Math.round(percentage)} />
        </div>
      </section>
    </div>
  );
};

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "../../shadcn-ui/chart";

export const description = "A radial chart with text";

const chartData = [{ browser: "safari", percentage: 68, fill: "#007AFF" }];

const chartConfig = {
  percentage: {
    label: "Percentage",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface RadialPercentageChartProps {
  percentage: number;
}

const ChartRadialText: React.FC<RadialPercentageChartProps> = ({
  percentage,
}) => {
  const dynamicEndAngle = 90 - (360 * percentage) / 100;

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square ">
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={dynamicEndAngle}
        innerRadius={80}
        outerRadius={110}
        barSize={30}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-white/20 last:fill-black"
          polarRadius={[86, 74]}
        />

        <RadialBar dataKey="percentage" background cornerRadius={10} />

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
                      {percentage.toLocaleString() + "%"}
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
