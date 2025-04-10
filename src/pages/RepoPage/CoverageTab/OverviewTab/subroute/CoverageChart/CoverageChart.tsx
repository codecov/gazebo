import { keepPreviousData } from '@tanstack/react-queryV5'
import { format } from 'date-fns'
import { useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { useBranches } from 'services/branches/useBranches'
import { useRepoOverview } from 'services/repo'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from 'ui/Chart'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

const Placeholder = () => (
  <div
    data-testid="coverage-chart-placeholder"
    className="h-[250px] min-h-[200px] w-full animate-pulse rounded bg-ds-gray-tertiary xl:h-[380px]"
  />
)

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function CoverageChart() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const { data: branchesData } = useBranches({ repo, provider, owner })
  const { selection } = useBranchSelector({
    branches: branchesData?.branches ?? [],
    defaultBranch: overview?.defaultBranch ?? '',
  })

  const { data, isPlaceholderData, isPending, isError } =
    useRepoCoverageTimeseries({
      branch: selection?.name,
      options: {
        enabled: !!selection?.name,
        placeholderData: keepPreviousData,
      },
    })

  if (!isPlaceholderData && isPending) {
    return <Placeholder />
  }

  if (isError) {
    return (
      <div className="flex min-h-[250px] items-center justify-center xl:min-h-[380px]">
        <p className="text-center">The coverage chart failed to load.</p>
      </div>
    )
  }

  const dataCount = data?.measurements?.length ?? 0
  if (dataCount < 1) {
    return (
      <div className="flex min-h-[250px] items-center justify-center xl:min-h-[380px]">
        <p className="text-center">
          Not enough coverage data to display chart.
        </p>
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
    <ChartContainer
      config={chartConfig}
      className="max-h-[250px] min-h-[200px] w-full xl:max-h-[380px]"
    >
      <AreaChart
        accessibilityLayer
        data={data?.measurements}
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
          tickFormatter={(date) => formatDate(date)}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value, payload) =>
                formatDate(payload?.[0]?.payload?.date)
              }
              valueFormatter={(value) => `${value.toFixed(2)}%`}
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
  )
}

export default CoverageChart
