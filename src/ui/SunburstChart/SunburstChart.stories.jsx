import data from './data'
import SunburstChart from './SunburstChart'

const Template = (args) => (
  <div className="w-[100vh] mx-auto">
    <SunburstChart {...args} />
  </div>
)

export const NormalSunburstChart = Template.bind({})
NormalSunburstChart.args = {
  data: data,
}

export default {
  title: 'Components/SunburstChart',
  component: SunburstChart,
  argTypes: { onClick: { action: 'clicked' } },
}
