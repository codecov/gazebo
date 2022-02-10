import Change from './Change'

const Template = (args) => <Change {...args} />

export const ChangeTable = Template.bind({})
ChangeTable.args = {
  value: 34,
  variant: 'table',
}

export const NegativeChangeTable = Template.bind({})
NegativeChangeTable.args = {
  value: -14,
  variant: 'table',
}

export const ChangeCard = Template.bind({})
ChangeCard.args = {
  value: 22,
  variant: 'coverageCard',
}

export const NegativeChangeCard = Template.bind({})
NegativeChangeCard.args = {
  value: -98,
  variant: 'coverageCard',
}

export default {
  title: 'Components/Change',
  component: Change,
}
