import { Meta, StoryObj } from '@storybook/react'

import Badge from './Badge'

export default {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      options: ['default', 'danger', 'success'],
      control: 'select',
      description:
        'This prop controls the variation of badge that is displayed',
    },
    size: {
      options: ['xs'],
      control: 'select',
      description: 'This prop controls the size of the badge',
    },
    children: {
      control: 'text',
    },
  },
} as Meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'xs',
    children: 'beta',
  },
  render: (args) => <Badge {...args} />,
}
