import CoverageLineIndicator from './CoverageLineIndicator'

const Template = (args) => <CoverageLineIndicator {...args} />

export const BaseCoverageLineIndicator = Template.bind({})
BaseCoverageLineIndicator.args = {
  coverage: 'COVERED',
  hitCount: 5,
}

export default {
  title: 'Components/CodeRenderer/CoverageLineIndicator',
  component: CoverageLineIndicator,
  argTypes: {
    coverage: {
      type: 'select',
      options: ['COVERED', 'PARTIAL', 'UNCOVERED', 'BLANK'],
    },
  },
}
