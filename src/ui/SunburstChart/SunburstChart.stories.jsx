import data from './data'
import SunburstChart from './SunburstChart'

const Template = (args) => (
  <div className="mx-auto w-2/5">
    <SunburstChart {...args} />
  </div>
)

export const NormalSunburstChart = Template.bind({})
NormalSunburstChart.args = {
  data: data,
  svgFontSize: '16px',
  svgRenderSize: 964,
}

export default {
  title: 'Components/SunburstChart',
  component: SunburstChart,
  argTypes: { onClick: { action: 'clicked' } },
}
