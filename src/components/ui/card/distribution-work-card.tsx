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

const DistributionWorkCard: React.FC = () => {
  return (
    <Card className="w-full h-full p-4 rounded-3xl border border-white/50 text-white bg-transparent">
      <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
        <FaRegClock className="inline" /> Distribuição de Carga Horária
      </h1>
      <section className="flex-1 min-h-0 w-full">
        <ChartPieDonut />
      </section>
    </Card>
  );
};

export const description = "A donut chart";

const chartData = [
  { hours_name: "obrigatorias", hours: 2600, fill: "#007AFF" },
  { hours_name: "complementares", hours: 500, fill: "#00FF88 " },
  { hours_name: "optativas", hours: 200, fill: "#FF3B30" },
];

const chartConfig = {
  Horas: {
    label: "Horas",
  },
  obrigatorias: {
    label: "obrigatorias",
    color: "var(--chart-1)",
  },
  complementares: {
    label: "complementares",
    color: "var(--chart-2)",
  },
  optativas: {
    label: "optativas",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ChartPieDonut() {
  return (
    <CardContent className="flex-1 pb-0 text-white">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-62.5"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent hideLabel className="bg-black text-white" />
            }
          />
          <Pie
            data={chartData}
            dataKey="hours"
            nameKey="hours_name"
            innerRadius={60}
          />
          <ChartLegend
            className="text-white text-sm"
            content={<ChartLegendContent className="text-white" />}
          />
        </PieChart>
      </ChartContainer>
    </CardContent>
  );
}

export default DistributionWorkCard;
