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

const CHART_CONFIG = {
  yield_coefficient: {
    label: "CR",
    color: "#00FF88",
  },
} satisfies ChartConfig;

const COLORS = {
  positive: "#00FF88",
  negative: "#FF3B30",
  subtitle: "#888888",
} as const;

const calculateDifference = (current: number, previous: number) => {
  const value = current - previous;
  const isPositive = value > 0;
  const prefix = value > 0 ? "+" : "";

  return {
    value,
    isPositive,
    formatted: value !== 0 ? `${prefix}${value.toFixed(2)}` : "",
  };
};

const YieldCoefficientChart = ({
  semesters,
}: {
  semesters: SemesterData[];
}) => {
  if (semesters.length <= 1) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-[#888888] sm:text-sm">
        Sem dados suficientes para gerar o gráfico...
      </div>
    );
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="h-full w-full">
      <AreaChart accessibilityLayer data={semesters}>
        <CartesianGrid vertical={false} horizontal={false} />
        <XAxis
          dataKey="semester"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              className="bg-black text-xs text-white sm:text-sm"
            />
          }
        />
        <Area
          dataKey="yield_coefficient"
          type="linear"
          fill="transparent"
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
    <Card className="flex h-64 w-full flex-col rounded-2xl border border-white/50 bg-transparent p-4 text-white sm:h-72 sm:rounded-3xl sm:p-5">
      <section className="mb-2 flex shrink-0 flex-col gap-1 sm:mb-4 sm:gap-2">
        <h1 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#888888] uppercase sm:gap-2 sm:text-sm">
          <IoMdTrendingUp className="inline text-sm sm:text-base" /> Coeficiente
          de Rendimento
        </h1>

        <div className="flex items-end gap-2">
          <span className="text-4xl leading-none font-light sm:text-5xl md:text-6xl">
            {currentValue}
          </span>

          {difference.formatted && (
            <div className="mb-0.5 flex flex-row items-center sm:mb-1">
              <TrendIcon
                className="text-base sm:text-lg"
                style={{ color: trendColor }}
              />
              <span
                className="text-sm font-semibold sm:text-base"
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
