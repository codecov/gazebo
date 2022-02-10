import Change from './Change'

const Template = (args) => <Change {...args} />

export const ChangeNumber = Template.bind({})
ChangeNumber.args = {
  value: 34,
  variant: 'default',
}

export const NegativeChangeNumber = Template.bind({})
NegativeChangeNumber.args = {
  value: -14,
  variant: 'default',
}

export const NoChangeNumber = Template.bind({})
NoChangeNumber.args = {
  value: 0,
  variant: 'default',
}

export const ChangeCoverageCard = Template.bind({})
ChangeCoverageCard.args = {
  value: 22,
  variant: 'coverageCard',
}

export const NegativeChangeCoverageCard = Template.bind({})
NegativeChangeCoverageCard.args = {
  value: -98,
  variant: 'coverageCard',
}

export default {
  title: 'Components/Change',
  component: Change,
}
