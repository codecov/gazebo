import CIStatus from './CIStatus'

const Template = (args) => <CIStatus {...args} />

export const Passing = Template.bind({})
Passing.args = {
  ciPassed: true,
}

export const Failing = Template.bind({})
Failing.args = {
  ciPassed: false,
}

export const NoStatus = Template.bind({})
NoStatus.args = {
  ciPassed: null,
}

export default {
  title: 'Components/CIStatus',
  component: CIStatus,
}
