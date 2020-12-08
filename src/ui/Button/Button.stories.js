import Button from './Button'

const Template = (args) => <Button {...args} />

export const NormalButton = Template.bind({})
NormalButton.args = {
  children: 'Normal button',
}

export const PinkButton = Template.bind({})
PinkButton.args = {
  children: 'Normal button',
  color: 'pink',
}

export const RedButton = Template.bind({})
RedButton.args = {
  children: 'Normal Red button',
  color: 'red',
}

export const GrayButton = Template.bind({})
GrayButton.args = {
  children: 'Normal Gray button',
  color: 'gray',
}

export const OutlineButton = Template.bind({})
OutlineButton.args = {
  children: 'Outline button',
  variant: 'outline',
}

export const TextButton = Template.bind({})
TextButton.args = {
  children: 'Outline button',
  variant: 'text',
}

export default {
  title: 'Components/Button',
  component: Button,
}
