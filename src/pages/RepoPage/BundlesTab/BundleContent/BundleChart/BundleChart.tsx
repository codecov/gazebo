import { format } from 'date-fns'
import { useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from 'ui/Chart'

import { useBundleChartData } from './useBundleChartData'

const Placeholder = () => (
  <div
    data-testid="bundle-chart-placeholder"
    className="h-[23rem] animate-pulse rounded bg-ds-gray-tertiary"
  />
)

const jsConfig = {
  JAVASCRIPT_SIZE: {
    label: 'JS',
    color: 'hsl(var(--color-bundle-chart-js))',
  },
} satisfies ChartConfig

const cssConfig = {
  STYLESHEET_SIZE: {
    label: 'CSS',
    color: 'hsl(var(--color-bundle-chart-css))',
  },
} satisfies ChartConfig

const imageConfig = {
  IMAGE_SIZE: {
    label: 'Images',
    color: 'hsl(var(--color-bundle-chart-image))',
  },
} satisfies ChartConfig

const fontConfig = {
  FONT_SIZE: {
    label: 'Fonts',
    color: 'hsl(var(--color-bundle-chart-font))',
  },
} satisfies ChartConfig

const unknownConfig = {
  UNKNOWN_SIZE: {
    label: 'Media',
    color: 'hsl(var(--color-bundle-chart-unknown))',
  },
} satisfies ChartConfig

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

export function BundleChart() {
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()
  const { data, maxY, multiplier, isLoading, assetTypes } = useBundleChartData({
    provider,
    owner,
    repo,
    branch,
    bundle,
  })

  let chartConfig = {} satisfies ChartConfig
  for (const assetType of assetTypes) {
    switch (assetType) {
      case 'JAVASCRIPT_SIZE':
        chartConfig = { ...chartConfig, ...jsConfig }
        break
      case 'STYLESHEET_SIZE':
        chartConfig = { ...chartConfig, ...cssConfig }
        break
      case 'IMAGE_SIZE':
        chartConfig = { ...chartConfig, ...imageConfig }
        break
      case 'FONT_SIZE':
        chartConfig = { ...chartConfig, ...fontConfig }
        break
      case 'UNKNOWN_SIZE':
        chartConfig = { ...chartConfig, ...unknownConfig }
        break
    }
  }

  return (
    <div className="mx-auto w-[98%] pb-4 pt-1">
      {isLoading ? (
        <Placeholder />
      ) : (
        <ChartContainer
          config={chartConfig}
          className="max-h-[425px] min-h-[200px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              max={maxY / multiplier}
              min={0}
              tickMargin={8}
              tickLine={false}
              axisLine={false}
              orientation="left"
              tickFormatter={(tick) => formatSizeToString(tick)}
            />
            <XAxis
              dataKey="date"
              tickMargin={8}
              tickLine={false}
              minTickGap={50}
              axisLine={false}
              tickFormatter={(date: string) =>
                format(new Date(date), 'MMM d, yyyy')
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value, payload) => {
                    const date = payload?.[0]?.payload?.date
                    return format(new Date(date), 'MMM d, yyyy')
                  }}
                  valueFormatter={(value: number) => {
                    return `${formatSizeToString(value)}`
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {assetTypes.map((assetType, i) => (
              <Area
                key={i}
                dataKey={assetType}
                stackId="1"
                type="linear"
                fillOpacity={0.75}
                fill={`var(--color-${assetType})`}
                strokeOpacity={1}
                stroke={`var(--color-${assetType})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  )
}
