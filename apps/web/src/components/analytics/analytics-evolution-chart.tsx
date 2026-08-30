import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useTranslation } from "react-i18next"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlyEvolution } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

type AnalyticsEvolutionChartProps = {
  data: MonthlyEvolution[]
}

export function AnalyticsEvolutionChart({
  data,
}: AnalyticsEvolutionChartProps) {
  const { t, i18n } = useTranslation()

  const chartConfig: ChartConfig = {
    income: {
      label: t("analytics.stats.income"),
      color: "var(--chart-1)",
    },
    expenses: {
      label: t("analytics.stats.expenses"),
      color: "var(--chart-4)",
    },
  }

  const formatMonthLabel = (month: string) => {
    const [year, monthNumber] = month.split("-").map(Number)
    return new Intl.DateTimeFormat(i18n.language, { month: "short" }).format(
      new Date(Date.UTC(year, monthNumber - 1, 1))
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <AreaChart data={data} margin={{ left: 8, right: 8 }}>
        <defs>
          <linearGradient id="fill-income" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-income)"
              stopOpacity={0.4}
            />
            <stop
              offset="95%"
              stopColor="var(--color-income)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient id="fill-expenses" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-expenses)"
              stopOpacity={0.4}
            />
            <stop
              offset="95%"
              stopColor="var(--color-expenses)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatMonthLabel}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={56}
          tickFormatter={(value: number) => formatCurrency(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) => formatMonthLabel(String(label))}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: `var(--color-${String(name)})`,
                      }}
                    />
                    {chartConfig[name as keyof typeof chartConfig]?.label ??
                      name}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="income"
          type="monotone"
          fill="url(#fill-income)"
          stroke="var(--color-income)"
          stackId="none"
        />
        <Area
          dataKey="expenses"
          type="monotone"
          fill="url(#fill-expenses)"
          stroke="var(--color-expenses)"
          stackId="none"
        />
      </AreaChart>
    </ChartContainer>
  )
}
