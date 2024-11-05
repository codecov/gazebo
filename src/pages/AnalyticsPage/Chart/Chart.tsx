import { format } from 'date-fns'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from 'ui/Chart'
import Icon from 'ui/Icon'
import LoadingLogo from 'ui/LoadingLogo'

import { useCoverage } from './useCoverage'

// exporting for testing
export const formatDate = (date: string) =>
  format(new Date(date), 'MMM d, yyyy')

interface ChartProps {
  params: {
    startDate: Date | null
    endDate: Date | null
    repositories: string[]
  }
}

function Chart({ params }: ChartProps) {
  const {
    data: coverage,
    isPreviousData,
    isLoading,
    isError,
  } = useCoverage({
    params: {
      startDate: params.startDate ? params.startDate : null,
      endDate: params.endDate ? params.endDate : null,
      repositories: params.repositories,
    },
    options: {
      suspense: false,
      keepPreviousData: true,
    },
  })

  if (!isPreviousData && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingLogo />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex max-h-[260px] min-h-[200px] w-full items-center justify-center">
        <p>The coverage chart failed to load.</p>
      </div>
    )
  }

  if (coverage.length < 2) {
    return (
      <div className="flex max-h-[260px] min-h-[200px] w-full items-center justify-center">
        <p>Not enough coverage data to display chart.</p>
      </div>
    )
  }

  const chartConfig = {
    coverage: {
      label: 'Coverage',
      color: 'rgb(var(--color-chart-area-stroke))',
    },
  } satisfies ChartConfig

  return (
    <>
      <p className="flex items-center gap-1 self-end text-sm text-ds-gray-quinary">
        <Icon name="informationCircle" size="sm" />
        Data is average of selected repos
      </p>
      <ChartContainer
        config={chartConfig}
        className="max-h-[260px] min-h-[200px] w-full"
      >
        <AreaChart
          accessibilityLayer
          data={coverage}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <YAxis
            max={100}
            min={0}
            tickMargin={8}
            tickLine={false}
            axisLine={false}
            orientation="left"
            tickFormatter={(tick) => `${tick}%`}
          />
          <XAxis
            dataKey="date"
            tickMargin={8}
            tickLine={false}
            minTickGap={50}
            axisLine={false}
            tickFormatter={(date: string) => formatDate(date)}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value, payload) =>
                  formatDate(payload?.[0]?.payload?.date)
                }
                valueFormatter={(value: number) => `${value.toFixed(2)}%`}
              />
            }
          />
          <Area
            dataKey="coverage"
            type="linear"
            fillOpacity={0.15}
            fill="var(--color-coverage)"
            strokeOpacity={1}
            stroke="var(--color-coverage)"
          />
        </AreaChart>
      </ChartContainer>
    </>
  )
}

export default Chart
