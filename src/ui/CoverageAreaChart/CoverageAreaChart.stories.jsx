import { format } from 'date-fns'

import CoverageAreaChart from './CoverageAreaChart'

const Template = (args) => <CoverageAreaChart {...args} />

export const SimpleCoverageAreaChart = Template.bind({})
SimpleCoverageAreaChart.args = {
  data: [
    { date: new Date('December 10, 2022'), coverage: 17 },
    { date: new Date('December 12, 2022'), coverage: 10 },
    { date: new Date('December 17, 2022'), coverage: 6 },
    { date: new Date('December 22, 2022'), coverage: 45 },
    { date: new Date('December 25, 2022'), coverage: 74 },
  ],
  axisLabelFunc: (time) => format(time, 'MMM d'),
  desc: 'Hello',
  title: 'Chart example',
  renderAreaChart: true,
}

export const NoDataCoverageAreaChart = Template.bind({})
NoDataCoverageAreaChart.args = {
  data: [{ date: new Date(), coverage: 10 }],
  axisLabelFunc: (time) => format(time, 'MMM d'),
  desc: 'Hello',
  title: 'Chart example',
  renderAreaChart: true,
}

export default {
  title: 'Components/CoverageAreaChart',
  component: CoverageAreaChart,
}
