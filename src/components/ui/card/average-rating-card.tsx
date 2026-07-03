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
  semesters_data: { semester: string; yield_coefficient: number | null }[];
}

const averageRatingChartConfig = {
  yield_coefficient: { label: "CR", color: "#007AFF" },
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
      <ChartContainer
        config={averageRatingChartConfig}
        className="h-full w-full"
      >
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
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="var(--color-yield_coefficient)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity={0.15}
            className="text-white"
          />

          <XAxis
            dataKey="semester"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#555555" }}
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
            tick={{ fontSize: 10, fill: "#555555" }}
            width={40}
          />

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                className="border-[#1A1A1A] bg-[#0A0A0A] p-2 text-xs text-white"
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
              fill: "#0A0A0A",
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

export const AverageRatingCard: React.FC<ChartLineLabelProps> = ({
  semesters_data,
}) => {
  return (
    <Card className="flex h-full w-full flex-col rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 text-white shadow-lg">
      <header className="flex items-center gap-2 text-sm font-semibold tracking-wider text-zinc-400">
        <IoMdTrendingUp className="shrink-0" />
        <span>Evolução do Rendimento</span>
      </header>
      <section className="min-h-0 w-full flex-1">
        <ChartLineLabel semesters_data={semesters_data} />
      </section>
    </Card>
  );
};
