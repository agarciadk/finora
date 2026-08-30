import { Cell, Pie, PieChart } from "recharts"
import { useTranslation } from "react-i18next"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { SpendingByCategory } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type AnalyticsCategoryChartProps = {
  data: SpendingByCategory[]
}

export function AnalyticsCategoryChart({ data }: AnalyticsCategoryChartProps) {
  const { t } = useTranslation()

  const chartData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const chartConfig: ChartConfig = Object.fromEntries(
    chartData.map((item, index) => [
      item.categoryId,
      { label: item.category, color: CHART_COLORS[index % CHART_COLORS.length] },
    ])
  )

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("analytics.empty")}</p>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto h-72 max-h-72">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="categoryId"
              formatter={(value, _name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: String(item.payload?.fill ?? ""),
                      }}
                    />
                    {String(item.payload?.category ?? "")}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatCurrency(Number(value))} ·{" "}
                    {Number(item.payload?.percentage ?? 0)}%
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="categoryId"
          innerRadius={60}
          strokeWidth={4}
        >
          {chartData.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="categoryId" />}
          verticalAlign="bottom"
        />
      </PieChart>
    </ChartContainer>
  )
}
