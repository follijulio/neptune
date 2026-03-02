"use client";

import { IoMdTrendingUp } from "react-icons/io";
import { Card } from "../../shadcn-ui/card";
import { RiArrowRightDownLine, RiArrowRightUpLine } from "react-icons/ri";
import { AreaChart, CartesianGrid, XAxis, Area } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../shadcn-ui/chart";

interface YieldCoefficientCardProps {
  percentage: number;
  previousValue: number;
  semesters: SemesterDataProps[];
}

interface SemesterDataProps {
  semester: string;
  yield_coefficient: number;
}

export const YieldCoefficientCard: React.FC<YieldCoefficientCardProps> = ({
  percentage,
  previousValue,
  semesters,
}) => {
  const difference = percentage - previousValue;
  const improve = difference > 0;
  const Icon = improve ? RiArrowRightUpLine : RiArrowRightDownLine;
  const prefix = improve ? "+" : "";

  return (
    <Card className="w-full h-72 p-4 rounded-3xl border border-white/50 bg-transparent text-white">
      <section className="gap-2 flex flex-col h-1/3 w-full">
        <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
          <IoMdTrendingUp className="inline" /> Coeficiente de Rendimiento
        </h1>

        <div className="flex items-end gap-2">
          <span className="text-6xl font-light">{percentage}</span>

          <div className="flex flex-row items-center">
            <Icon
              className={`text-lg ${improve ? "text-[#00FF88]" : "text-[#FF3B30]"}`}
            />

            <span
              className={`text-base font-semibold ${improve ? "text-[#00FF88]" : "text-[#FF3B30]"}`}
            >
              {difference !== 0 &&
                (improve
                  ? `${prefix}${difference.toFixed(1)}`
                  : `${prefix}${difference.toFixed(1)}`)}
            </span>
          </div>
        </div>
      </section>

      <section className="h-2/3 w-full">
        {semesters.length > 1 ? (
          <ChartAreaDefault semesters={semesters} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#888888]">
            Sem dados suficientes para gerar o gráfico...
          </div>
        )}
      </section>
    </Card>
  );
};

export const description = "A simple area chart";

const CHART_CONFIG = {
  yield_coefficient: {
    label: "CR",
    color: "#00FF88",
  },
} satisfies ChartConfig;

const ChartAreaDefault: React.FC<{ semesters: SemesterDataProps[] }> = ({
  semesters,
}) => {
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
