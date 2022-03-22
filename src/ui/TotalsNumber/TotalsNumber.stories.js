import TotalsNumber from './TotalsNumber'

const Template = (args) => <TotalsNumber {...args} />

export const InlineNumber = Template.bind({})
InlineNumber.args = {
  value: 34,
  inline: true,
}

export const NumberWithChange = Template.bind({})
NumberWithChange.args = {
  value: 22,
  showChange: true,
}

export const NegativeNumber = Template.bind({})
NegativeNumber.args = {
  value: -39,
}

export const LargeNumberWithChange = Template.bind({})
LargeNumberWithChange.args = {
  value: 78,
  large: true,
  showChange: true,
}

export const LargeNegativeNumberWithChange = Template.bind({})
LargeNegativeNumberWithChange.args = {
  value: -63,
  showChange: true,
  large: true,
}

export const PlainLargeNumber = Template.bind({})
PlainLargeNumber.args = {
  value: 78,
  large: true,
  plain: true,
}

export const NoValue = Template.bind({})
NoValue.args = {
  value: 0,
}

export default {
  title: 'Components/TotalsNumber',
  component: TotalsNumber,
}
