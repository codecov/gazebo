import SummaryRoot from './SummaryRoot'

import SummaryFeild from '../SummaryField'

const Template = (args) => (
  <SummaryRoot {...args}>
    <SummaryFeild title="One summary">One summary</SummaryFeild>
    <SummaryFeild title="Two summary">Two summary</SummaryFeild>
    <SummaryFeild>Summary with no title</SummaryFeild>
  </SummaryRoot>
)

export const DefaultSummaryRoot = Template.bind({})
DefaultSummaryRoot.args = {}

export default {
  title: 'Components/Summary/SummaryRoot',
  component: SummaryRoot,
}
