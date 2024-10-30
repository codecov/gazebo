import type { Meta, StoryObj } from '@storybook/react'

import Label from './Label'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    variant: {
      options: ['default', 'subtle', 'plain'],
      control: { type: 'select' },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const SimpleLabel: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => (
    <div className="flex gap-2">
      <Label {...args}>Some label 🤠</Label>
      <Label {...args}>
        <span className="text-ds-pink-default">Dynamic</span> Content
      </Label>
    </div>
  ),
}

export const SubtleLabel: Story = {
  args: { variant: 'subtle' },
  render: (args) => (
    <div className="flex gap-2">
      <Label {...args}>Some label 🤠</Label>
      <Label {...args}>
        <span className="text-ds-pink-default">Dynamic</span> Content
      </Label>
    </div>
  ),
}

export const PlainLabel: Story = {
  args: { variant: 'plain' },
  render: (args) => (
    <div className="flex gap-2">
      <Label {...args}>Label in light mode</Label>
      <div className="dark">
        <Label {...args}>Label in dark mode</Label>
      </div>
    </div>
  ),
}

export const LabelInherits: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => (
    <div className="text-ds-blue-default">
      <p>
        Default inherits the current css color making it extremely flexible. The
        subtle variant will not.
      </p>
      <Label {...args}>Label which can use the `current` css property</Label>
    </div>
  ),
}
