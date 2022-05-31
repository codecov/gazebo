import Button from './Button'

import Icon from '../Icon'

const Template = (args) => <Button {...args} />

export const NormalButton = Template.bind({})
NormalButton.args = {
  children: 'Normal button',
  variant: 'default',
  disabled: false,
}

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  children: 'Primary button',
  variant: 'primary',
  disabled: false,
}

export const DangerButton = Template.bind({})
DangerButton.args = {
  children: 'Danger button',
  variant: 'danger',
  disabled: false,
}

export const DisabledButton = Template.bind({})
DisabledButton.args = {
  children: 'Disabled button',
  disabled: true,
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  children: 'Secondary button',
  variant: 'secondary',
  disabled: false,
}

export const ActiveButton = Template.bind({})
ActiveButton.args = {
  children: 'Active button',
  variant: 'active',
  disabled: false,
}

export const MixedButton = Template.bind({})
MixedButton.args = {
  children: (
    <>
      Mixed content <Icon name="search" size="sm" />
    </>
  ),
}

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: { onClick: { action: 'clicked' } },
}
