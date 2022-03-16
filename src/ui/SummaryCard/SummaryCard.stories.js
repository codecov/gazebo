import SummaryCard from './SummaryCard'

const Template = (args) => <SummaryCard {...args} />

export const DefaultSummaryCard = Template.bind({})
DefaultSummaryCard.args = {
  title: 'Sample title',
  children: <span>Simple markup</span>,
}

export const SummaryCardNoTitle = Template.bind({})
SummaryCardNoTitle.args = {
  title: null,
  children: <span>Simple markup</span>,
}

export const SummaryCardNoChildren = Template.bind({})
SummaryCardNoChildren.args = {
  title: 'Another sample title',
  children: null,
}

export default {
  title: 'Components/SummaryCard',
  component: SummaryCard,
}
