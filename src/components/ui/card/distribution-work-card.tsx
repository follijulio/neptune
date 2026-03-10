"use client";

import { Pie, PieChart } from "recharts";
import { Card, CardContent } from "../../shadcn-ui/card";
import { FaRegClock } from "react-icons/fa";
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
  const chartDataWithColors = ChartData.map((entry) => ({
    ...entry,
    fill: getColor(entry.hours_name),
  }));

  const dynamicConfig = ChartData.reduce((config, entry) => {
    config[entry.hours_name] = {
      label:
        entry.hours_name.charAt(0).toUpperCase() + entry.hours_name.slice(1),
      color: getColor(entry.hours_name),
    };
    return config;
  }, {} as ChartConfig);

  const finalChartConfig = {
    ...chartConfigBase,
    ...dynamicConfig,
  } satisfies ChartConfig;

  return (
    <CardContent className="flex-1 pb-0 text-white">
      <ChartContainer
        config={finalChartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            active
            content={
              <ChartTooltipContent
                hideLabel
                className="flex flex-row gap-2 border-white/20 bg-black text-white"
              />
            }
          />
          <Pie
            data={chartDataWithColors}
            dataKey="hours"
            nameKey="hours_name"
            innerRadius={60}
            stroke="none"
          />
          <ChartLegend
            className="text-sm text-white"
            content={<ChartLegendContent className="text-white" />}
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
    <Card className="h-full w-full rounded-3xl border border-white/50 bg-transparent p-4 text-white">
      <h1 className="mb-4 flex items-center gap-2 font-semibold text-[#888888]">
        <FaRegClock className="inline" /> Distribuição de Carga Horária
      </h1>
      <section className="min-h-0 w-full flex-1">
        <ChartPieDonut ChartData={ChartData} />
      </section>
    </Card>
  );
};
