"use client";

import { useMemo } from "react";
import { IoMdTrendingUp } from "react-icons/io";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { AxisDomain } from "recharts/types/util/types";

import { Card, CardContent } from "../../shadcn-ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../shadcn-ui/chart";

interface ChartLineLabelProps {
  semesters_data: SemesterDataProps[];
}

interface SemesterDataProps {
  semester: string;
  yield_coefficient: number | null;
}

export const AverageRatingCard: React.FC<ChartLineLabelProps> = ({
  semesters_data,
}) => {
  return (
    <Card className="flex h-72 w-full flex-col rounded-2xl border border-white/50 bg-transparent p-3 text-white sm:h-96 sm:rounded-3xl sm:p-4">
      <h1 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#888888] uppercase sm:mb-4 sm:gap-2 sm:text-sm">
        <IoMdTrendingUp className="inline shrink-0 text-sm sm:text-base" />
        <span className="truncate">Evolução do Rendimento</span>
      </h1>
      <section className="min-h-0 w-full flex-1">
        <ChartLineLabel semesters_data={semesters_data} />
      </section>
    </Card>
  );
};

export const description = "A line chart with a label";

const chartConfig = {
  yield_coefficient: {
    label: "CR",
    color: "#007AFF",
  },
} satisfies ChartConfig;

export const ChartLineLabel: React.FC<ChartLineLabelProps> = ({
  semesters_data,
}) => {
  const yAxisDomain = useMemo(
    () =>
      [
        (dataMin: number) => Math.floor((dataMin - 0.2) * 2) / 2,
        10,
      ] as AxisDomain,
    [],
  );

  const yAxisFormatter = useMemo(
    () => (value: number) =>
      value.toLocaleString("pt-BR", { minimumFractionDigits: 1 }),
    [],
  );

  return (
    <CardContent className="h-full w-full p-0">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          className="h-full"
          data={semesters_data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="fillyield_coefficient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--color-yield_coefficient)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="var(--color-yield_coefficient)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity={0.2}
            className="text-white"
          />

          <XAxis
            dataKey="semester"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#888888" }}
            tickMargin={8}
            minTickGap={15}
          />

          <YAxis
            domain={yAxisDomain}
            tickCount={6}
            allowDecimals
            tickFormatter={yAxisFormatter}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#888888" }}
            width={40}
          />

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                className="bg-black p-2 text-xs text-white sm:text-sm"
              />
            }
          />

          <Area
            fill="url(#fillyield_coefficient)"
            dataKey="yield_coefficient"
            stroke="var(--color-yield_coefficient)"
            strokeWidth={2}
            type="monotone"
            dot={{
              fill: "black",
              stroke: "var(--color-yield_coefficient)",
              strokeWidth: 2,
              r: 3,
            }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ChartContainer>
    </CardContent>
  );
};
