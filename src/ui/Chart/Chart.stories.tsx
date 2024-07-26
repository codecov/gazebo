import { Meta, StoryObj } from '@storybook/react'
import { format } from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './Chart'

const meta: Meta = {
  title: 'Components/Chart',
}

export default meta

const areaChartData = [
  { month: new Date('01/01/2024').toISOString(), coverage: 10 },
  { month: new Date('02/01/2024').toISOString(), coverage: 20 },
  { month: new Date('03/01/2024').toISOString(), coverage: 45 },
  { month: new Date('04/01/2024').toISOString(), coverage: 40 },
  { month: new Date('05/01/2024').toISOString(), coverage: 50 },
  { month: new Date('06/01/2024').toISOString(), coverage: 90 },
]

const areaChartConfig = {
  coverage: {
    label: 'Coverage',
    color: 'hsl(var(--chart-area-bundle-tab))',
  },
} satisfies ChartConfig

export const AreaChartStory: StoryObj = {
  render: () => (
    <ChartContainer
      config={areaChartConfig}
      className="max-h-[500px] min-h-[200px] w-full"
    >
      <AreaChart
        accessibilityLayer
        data={areaChartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={8}
          tickFormatter={(date: string) =>
            format(new Date(date), 'MMM d, yyyy')
          }
        />
        <YAxis
          max={100}
          tickLine={false}
          tickMargin={8}
          orientation="right"
          tickFormatter={(tick) => `${tick}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(date: string) =>
                format(new Date(date), 'MMM d, yyyy')
              }
              valueFormatter={(value: number) => `${value}%`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent nameKey="coverage" />} />
        <Area
          dataKey="coverage"
          type="linear"
          fillOpacity={0.4}
          fill="var(--color-coverage)"
          stroke="var(--color-coverage)"
        />
      </AreaChart>
    </ChartContainer>
  ),
}

const barChartData = [
  { month: new Date('01/01/2024').toISOString(), failed: 186, flaky: 80 },
  { month: new Date('02/01/2024').toISOString(), failed: 305, flaky: 200 },
  { month: new Date('03/01/2024').toISOString(), failed: 237, flaky: 120 },
  { month: new Date('04/01/2024').toISOString(), failed: 73, flaky: 190 },
  { month: new Date('05/01/2024').toISOString(), failed: 209, flaky: 130 },
  { month: new Date('06/01/2024').toISOString(), failed: 214, flaky: 140 },
]

const barChartConfig = {
  failed: {
    label: 'Failed',
    color: 'hsl(var(--chart-1))',
  },
  flaky: {
    label: 'Flaky',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export const BarChartStory: StoryObj = {
  render: () => (
    <ChartContainer
      config={barChartConfig}
      className="max-h-[500px] min-h-[200px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={barChartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={true}
          tickFormatter={(date: string) =>
            format(new Date(date), 'MMM d, yyyy')
          }
        />
        <YAxis tickLine={false} tickMargin={8} orientation="right" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(date: string) =>
                format(new Date(date), 'MMM d, yyyy')
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="failed"
          stackId="a"
          fill="var(--color-failed)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="flaky"
          stackId="a"
          fill="var(--color-flaky)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  ),
}
