import CoverageSelectIcon from './CoverageSelectIcon'

const Template = (args) => <CoverageSelectIcon {...args} />

export const UncoveredSelectIcon = Template.bind({})
UncoveredSelectIcon.args = {
  coverage: 'UNCOVERED',
}
export const PartialSelectIcon = Template.bind({})
PartialSelectIcon.args = {
  coverage: 'PARTIAL',
}

export default {
  title: 'Components/Icon/CoverageSelectIcon',
  component: CoverageSelectIcon,
}
