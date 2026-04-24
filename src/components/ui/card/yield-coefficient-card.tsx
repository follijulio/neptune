"use client";

import { useMemo } from "react";
import { IoMdTrendingUp } from "react-icons/io";
import { RiArrowRightDownLine, RiArrowRightUpLine } from "react-icons/ri";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card } from "../../shadcn-ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../shadcn-ui/chart";

interface SemesterData {
  semester: string;
  yield_coefficient: number | null;
}

interface YieldCoefficientCardProps {
  currentValue: number;
  previousValue: number;
  semesters: SemesterData[];
}

const chartConfig = {
  yield_coefficient: { label: "CR", color: "#00FF88" },
} satisfies ChartConfig;

const COLORS = {
  positive: "#00FF88",
  negative: "#FF3B30",
} as const;

const calculateDifference = (current: number, previous: number) => {
  const value = current - previous;
  const isPositive = value > 0;

  return {
    value,
    isPositive,
    formatted: value === 0 ? "" : `${isPositive ? "+" : ""}${value.toFixed(2)}`,
  };
};

const YieldCoefficientChart = ({
  semesters,
}: {
  semesters: SemesterData[];
}) => {
  if (semesters.length <= 1) {
    return (
      <div className="flex h-full min-h-[140px] items-center justify-center px-3 text-center text-xs text-zinc-600 sm:min-h-[160px] sm:text-sm">
        Sem dados suficientes para gerar o gráfico...
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full min-h-0 w-full">
      <AreaChart accessibilityLayer data={semesters}>
        <defs>
          <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00FF88" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00FF88" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} horizontal={false} />

        <XAxis
          dataKey="semester"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10, fill: "#555555" }}
        />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              className="border-[#1A1A1A] bg-[#0A0A0A] text-xs text-white"
            />
          }
        />

        <Area
          dataKey="yield_coefficient"
          type="linear"
          fill="url(#fillYield)"
          strokeWidth={2}
          stroke="var(--color-yield_coefficient)"
        />
      </AreaChart>
    </ChartContainer>
  );
};

export const YieldCoefficientCard = ({
  currentValue,
  previousValue,
  semesters,
}: YieldCoefficientCardProps) => {
  const difference = useMemo(
    () => calculateDifference(currentValue, previousValue),
    [currentValue, previousValue],
  );

  const TrendIcon = difference.isPositive
    ? RiArrowRightUpLine
    : RiArrowRightDownLine;

  const trendColor = difference.isPositive ? COLORS.positive : COLORS.negative;

  return (
    <Card className="flex h-full w-full flex-col rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 text-white shadow-lg sm:p-5 md:p-6">
      <section className="mb-3 flex shrink-0 flex-col gap-2 sm:mb-4 sm:gap-3">
        <h1 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 uppercase sm:text-sm">
          <IoMdTrendingUp className="shrink-0 text-sm" />
          Coeficiente de Rendimento
        </h1>

        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <span className="text-4xl leading-none font-light tabular-nums sm:text-5xl md:text-6xl">
            {currentValue}
          </span>

          {difference.formatted && (
            <div className="mb-0.5 flex items-center gap-1">
              <TrendIcon className="text-base" style={{ color: trendColor }} />
              <span
                className="text-sm font-semibold"
                style={{ color: trendColor }}
              >
                {difference.formatted}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="min-h-0 w-full flex-1">
        <YieldCoefficientChart semesters={semesters} />
      </section>
    </Card>
  );
};
