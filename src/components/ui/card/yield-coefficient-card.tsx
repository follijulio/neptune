"use client";

import { IoMdTrendingUp } from "react-icons/io";
import { RiArrowRightDownLine, RiArrowRightUpLine } from "react-icons/ri";
import { Area,AreaChart, CartesianGrid, XAxis } from "recharts";

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
      <div className="flex h-full items-center justify-center text-sm text-[#888888]">
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
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              className="bg-black text-white"
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
  const difference = calculateDifference(currentValue, previousValue);
  const TrendIcon = difference.isPositive
    ? RiArrowRightUpLine
    : RiArrowRightDownLine;
  const trendColor = difference.isPositive ? COLORS.positive : COLORS.negative;

  return (
    <Card className="h-72 w-full rounded-3xl border border-white/50 bg-transparent p-4 text-white">
      <section className="flex h-1/3 w-full flex-col gap-2">
        <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
          <IoMdTrendingUp className="inline" /> Coeficiente de Rendimento
        </h1>

        <div className="flex items-end gap-2">
          <span className="text-6xl font-light">{currentValue}</span>

          {difference.formatted && (
            <div className="flex flex-row items-center">
              <TrendIcon className="text-lg" style={{ color: trendColor }} />
              <span
                className="text-base font-semibold"
                style={{ color: trendColor }}
              >
                {difference.formatted}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="h-2/3 w-full">
        <YieldCoefficientChart semesters={semesters} />
      </section>
    </Card>
  );
};
