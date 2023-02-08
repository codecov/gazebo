import CoverageProgressComponent from './CoverageProgress'

const Template = (args) => <CoverageProgressComponent {...args} />

export const CoverageProgress = Template.bind({})
CoverageProgress.args = { amount: 50, color: 'primary' }

export const CoverageProgressNoReport = Template.bind({})
CoverageProgressNoReport.args = {
  amount: null,
  color: 'primary',
}

export default {
  title: 'Components/CoverageProgress',
  component: CoverageProgressComponent,
  argTypes: {
    color: {
      type: 'select',
      options: ['primary', 'neutral', 'danger', 'warning'],
    },
  },
}
