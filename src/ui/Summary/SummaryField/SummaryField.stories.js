import SummaryField from './SummaryField'

const Template = (args) => <SummaryField {...args} />

export const DefaultSummaryField = Template.bind({})
DefaultSummaryField.args = {
  title: 'Sample title',
  children: <span>Simple markup</span>,
}

export const SummaryFieldNoTitle = Template.bind({})
SummaryFieldNoTitle.args = {
  title: null,
  children: <span>Simple markup</span>,
}

export const SummaryFieldNoChildren = Template.bind({})
SummaryFieldNoChildren.args = {
  title: 'Another sample title',
  children: null,
}

export default {
  title: 'Components/Summary/SummaryField',
  component: SummaryField,
}
