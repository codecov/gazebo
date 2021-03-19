import Card from './Card'

const Template = (args) => <Card {...args} />

export const NormalCard = Template.bind({})
NormalCard.args = {
  children: 'hello everyone',
}

export const CardWithExtraClass = Template.bind({})
CardWithExtraClass.args = {
  children: 'hello everyone',
  className: 'p4 bg-blue',
}

export default {
  title: 'old_ui/Components/Card',
  component: Card,
}
