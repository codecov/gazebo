import { LINE_STATE } from 'shared/utils/fileviewer'

import { TitleCoverage } from './Title'

const Template = (args) => {
  return <TitleCoverage onChange={() => {}} {...args} />
}

export const DefaultTitle = Template.bind({})
DefaultTitle.args = {
  checked: true,
  coverage: LINE_STATE.COVERED,
}

export const UncheckedCoveredTitle = Template.bind({})
UncheckedCoveredTitle.args = {
  checked: false,
  coverage: LINE_STATE.COVERED,
}

export const PartialTitle = Template.bind({})
PartialTitle.args = {
  checked: true,
  coverage: LINE_STATE.PARTIAL,
}

export const UncoveredTitle = Template.bind({})
UncoveredTitle.args = {
  checked: true,
  coverage: LINE_STATE.UNCOVERED,
}

export default {
  title: 'Components/TitleCoverage',
  component: TitleCoverage,
}
