import CoverageProgressComponent from './CoverageProgress'

const Template = (args) => <CoverageProgressComponent {...args} />

export const CoverageProgress = Template.bind({})

CoverageProgress.args = {
  totals: {
    coverage: 50,
  },
  color: 'default',
}

export const CoverageProgressNoReport = Template.bind({})

CoverageProgressNoReport.args = {
  totals: {},
  color: 'default',
}

export default {
  title: 'Components/CoverageProgress',
  component: CoverageProgressComponent,
  argTypes: {
    color: {
      type: 'select',
      options: ['default', 'neutral', 'danger', 'warning'],
    },
  },
}
