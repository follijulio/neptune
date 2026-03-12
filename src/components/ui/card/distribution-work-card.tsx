"use client";

import { useMemo } from "react";
import { FaRegClock } from "react-icons/fa";
import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "../../shadcn-ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../shadcn-ui/chart";

export interface ChartDataEntry {
  hours_name: string;
  hours: number;
}

interface ChartPieDonutProps {
  ChartData: ChartDataEntry[];
}

export const description = "A donut chart";

function getColor(hours_name: string): string {
  const normalized = hours_name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  switch (normalized) {
    case "obrigatorias":
      return "#2D5BFF";
    case "complementares":
      return "#20C997";
    case "optativas":
      return "#AF52DE";
    case "tcc":
    case "trabalho de conclusao de curso":
      return "#FF9500";
    case "estagio":
      return "#FF2D55";
    default:
      return "#A2A2A6";
  }
}

const chartConfigBase = {
  hours: {
    label: "Horas",
  },
} satisfies ChartConfig;

export const ChartPieDonut: React.FC<ChartPieDonutProps> = ({ ChartData }) => {
  const chartDataWithColors = useMemo(
    () =>
      ChartData.map((entry) => ({
        ...entry,
        fill: getColor(entry.hours_name),
      })),
    [ChartData],
  );

  const dynamicConfig = useMemo(
    () =>
      ChartData.reduce((config, entry) => {
        config[entry.hours_name] = {
          label:
            entry.hours_name.charAt(0).toUpperCase() +
            entry.hours_name.slice(1),
          color: getColor(entry.hours_name),
        };
        return config;
      }, {} as ChartConfig),
    [ChartData],
  );

  const finalChartConfig = useMemo(
    () =>
      ({
        ...chartConfigBase,
        ...dynamicConfig,
      }) satisfies ChartConfig,
    [dynamicConfig],
  );

  return (
    <CardContent className="flex-1 p-0 pb-0 text-white">
      <ChartContainer
        config={finalChartConfig}
        className="mx-auto aspect-square max-h-50 w-full pb-0 sm:max-h-62.5"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                className="flex flex-row gap-1 border-white/20 bg-black p-2 text-xs text-white sm:gap-2 sm:text-sm"
              />
            }
          />
          <Pie
            data={chartDataWithColors}
            dataKey="hours"
            nameKey="hours_name"
            innerRadius={45}
            outerRadius={80}
            stroke="none"
          />
          <ChartLegend
            className="pt-2 text-[10px] text-white sm:pt-4 sm:text-sm"
            content={
              <ChartLegendContent className="flex-wrap justify-center gap-2 text-white sm:gap-4" />
            }
          />
        </PieChart>
      </ChartContainer>
    </CardContent>
  );
};

export const DistributionWorkCard: React.FC<ChartPieDonutProps> = ({
  ChartData,
}) => {
  return (
    <Card className="flex h-72 min-h-75 w-full flex-col rounded-2xl border border-white/50 bg-transparent p-4 text-white sm:h-auto sm:min-h-0 sm:rounded-3xl sm:p-5">
      <h1 className="mb-2 flex shrink-0 items-center gap-1.5 text-xs font-semibold tracking-wider text-[#888888] uppercase sm:mb-4 sm:gap-2 sm:text-sm">
        <FaRegClock className="inline shrink-0 text-sm sm:text-base" />
        <span className="truncate">Distribuição de Carga Horária</span>
      </h1>
      <section className="flex min-h-0 w-full flex-1 items-center justify-center pt-2 sm:pt-0">
        <ChartPieDonut ChartData={ChartData} />
      </section>
    </Card>
  );
};
