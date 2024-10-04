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

export const PlainButton = Template.bind({})
PlainButton.args = {
  children: 'Plain button',
  variant: 'plain',
}

export const ListboxButton = Template.bind({})
ListboxButton.args = {
  children: 'Listbox button',
  variant: 'listbox',
}

export const GitHubButton = Template.bind({})
GitHubButton.args = {
  children: 'GitHub Button',
  variant: 'github',
}

export const GitLabButton = Template.bind({})
GitLabButton.args = {
  children: 'GitLab Button',
  variant: 'gitlab',
}

export const BitbucketButton = Template.bind({})
BitbucketButton.args = {
  children: 'Bitbucket Button',
  variant: 'bitbucket',
}
export const OktaButton = Template.bind({})
OktaButton.args = {
  children: 'Okta Button',
  variant: 'okta',
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
