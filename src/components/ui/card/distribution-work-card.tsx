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

const chartConfigBase = { hours: { label: "Horas" } } satisfies ChartConfig;

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
    () => ({ ...chartConfigBase, ...dynamicConfig }) satisfies ChartConfig,
    [dynamicConfig],
  );

  return (
    <CardContent className="flex-1 p-0 pb-0 text-white">
      <ChartContainer
        config={finalChartConfig}
        className="mx-auto aspect-square max-h-48 w-full pb-0 sm:max-h-56"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                className="flex flex-row gap-1 border-[#1A1A1A] bg-[#0A0A0A] p-2 text-xs text-white sm:gap-2 sm:text-sm"
              />
            }
          />
          <Pie
            data={chartDataWithColors}
            dataKey="hours"
            nameKey="hours_name"
            innerRadius={45}
            outerRadius={75}
            stroke="none"
          />
          <ChartLegend
            className="pt-2 text-[10px] text-zinc-400 sm:pt-3 sm:text-xs"
            content={
              <ChartLegendContent className="flex-wrap justify-center gap-2 text-zinc-400 sm:gap-3" />
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
    <Card className="flex h-full w-full flex-col rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 text-white shadow-lg">
      <header className="flex items-center gap-2 text-sm font-semibold tracking-wider text-zinc-400">
        <FaRegClock className="shrink-0" />
        <span>Distribuição de Carga Horária</span>
      </header>
      <section className="flex min-h-0 w-full flex-1 items-center justify-center">
        <ChartPieDonut ChartData={ChartData} />
      </section>
    </Card>
  );
};
