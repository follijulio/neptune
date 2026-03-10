"use client";

import { IoMdTrendingUp } from "react-icons/io";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "../../shadcn-ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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
    <Card className="flex h-96 w-full flex-col rounded-3xl border border-white/50 bg-transparent p-4 text-white">
      <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
        <IoMdTrendingUp className="inline" /> Evolução do Rendimento (Histórico)
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
  return (
    <CardContent className="h-full w-full p-0">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          className="h-full"
          data={semesters_data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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

          <XAxis dataKey="semester" tickLine={false} axisLine={false} />

          <YAxis
            domain={[
              (dataMin: number) => Math.floor((dataMin - 0.2) * 2) / 2,
              10,
            ]}
            tickCount={8}
            allowDecimals
            tickFormatter={(value) =>
              value.toLocaleString("pt-BR", { minimumFractionDigits: 1 })
            }
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
            fill="url(#fillyield_coefficient)"
            dataKey="yield_coefficient"
            stroke="var(--color-yield_coefficient)"
            strokeWidth={2}
            type="monotone"
            dot={{
              fill: "black",
              stroke: "var(--color-yield_coefficient)",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ChartContainer>
    </CardContent>
  );
};
