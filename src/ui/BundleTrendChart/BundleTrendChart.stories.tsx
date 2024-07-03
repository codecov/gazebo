import { Meta, StoryObj } from '@storybook/react'

import { BundleTrendChart } from './BundleTrendChart'

type BundleTrendChartStory = React.ComponentProps<typeof BundleTrendChart> & {}

const meta: Meta<AbortController> = {
  title: 'Components/BundleTrendChart',
}

export default meta

type Story = StoryObj<BundleTrendChartStory>

const trendData = {
  maxY: 90,
  multiplier: 1,
  measurements: [
    { date: new Date('December 10, 2022'), size: 17 },
    { date: new Date('December 12, 2022'), size: 10 },
    { date: new Date('December 17, 2022'), size: 6 },
    { date: new Date('December 22, 2022'), size: 45 },
    { date: new Date('December 25, 2022'), size: 74 },
  ],
}

export const Default: Story = {
  render: () => (
    <BundleTrendChart
      data={trendData}
      title="Example with data"
      desc="Bundle trend chart with data"
    />
  ),
}

const noTrendData = {
  maxY: 2,
  multiplier: 1,
  measurements: [],
}

export const NoData: Story = {
  render: () => (
    <BundleTrendChart
      data={noTrendData}
      title="Example with no data"
      desc="Bundle trend chart with no data"
    />
  ),
}
