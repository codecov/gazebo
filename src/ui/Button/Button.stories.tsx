import { type Meta, type StoryObj } from '@storybook/react'

import Button from './Button'

import Icon from '../Icon'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: { onClick: { action: 'clicked' } },
}

export default meta

type Story = StoryObj<typeof Button>

export const NormalButton: Story = {
  args: {
    children: 'Normal button',
    variant: 'default',
    disabled: false,
  },
  render: (args) => <Button {...args} />,
}

export const PrimaryButton: Story = {
  args: {
    children: 'Primary button',
    variant: 'primary',
    disabled: false,
  },
  render: (args) => <Button {...args} />,
}

export const DangerButton: Story = {
  args: {
    children: 'Danger button',
    variant: 'danger',
    disabled: false,
  },
  render: (args) => <Button {...args} />,
}

export const DisabledButton: Story = {
  args: {
    children: 'Disabled button',
    disabled: true,
  },
  render: (args) => <Button {...args} />,
}

export const SecondaryButton: Story = {
  args: {
    children: 'Secondary button',
    variant: 'secondary',
    disabled: false,
  },
  render: (args) => <Button {...args} />,
}

export const PlainButton: Story = {
  args: {
    children: 'Plain button',
    variant: 'plain',
  },
  render: (args) => <Button {...args} />,
}

export const ListboxButton: Story = {
  args: {
    children: 'Listbox button',
    variant: 'listbox',
  },
  render: (args) => <Button {...args} />,
}

export const GitHubButton: Story = {
  args: {
    children: 'GitHub Button',
    variant: 'github',
  },
  render: (args) => <Button {...args} />,
}

export const GitLabButton: Story = {
  args: {
    children: 'GitLab Button',
    variant: 'gitlab',
  },
  render: (args) => <Button {...args} />,
}

export const BitbucketButton: Story = {
  args: {
    children: 'Bitbucket Button',
    variant: 'bitbucket',
  },
  render: (args) => <Button {...args} />,
}
export const OktaButton: Story = {
  args: {
    children: 'Okta Button',
    variant: 'okta',
  },
  render: (args) => <Button {...args} />,
}

export const MixedButton: Story = {
  args: {
    children: (
      <>
        Mixed content <Icon name="search" size="sm" />
      </>
    ),
  },
  render: (args) => <Button {...args} />,
}
