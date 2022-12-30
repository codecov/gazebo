import data from './data'
import SunburstChart from './SunburstChart'

const Template = (args) => (
  <div className="w-[50vw] mx-auto">
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
