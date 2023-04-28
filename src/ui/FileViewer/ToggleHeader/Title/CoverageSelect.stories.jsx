import { LINE_STATE } from 'shared/utils/fileviewer'

import { TitleCoverage } from './Title'

const Template = (args) => {
  return <TitleCoverage onChange={() => {}} {...args} />
}

export const DefaultTitle = {
  render: Template,

  args: {
    checked: true,
    coverage: LINE_STATE.COVERED,
  },
}

export const UncheckedCoveredTitle = {
  render: Template,

  args: {
    checked: false,
    coverage: LINE_STATE.COVERED,
  },
}

export const PartialTitle = {
  render: Template,

  args: {
    checked: true,
    coverage: LINE_STATE.PARTIAL,
  },
}

export const UncoveredTitle = {
  render: Template,

  args: {
    checked: true,
    coverage: LINE_STATE.UNCOVERED,
  },
}

export default {
  title: 'Components/TitleCoverage',
  component: TitleCoverage,
}
