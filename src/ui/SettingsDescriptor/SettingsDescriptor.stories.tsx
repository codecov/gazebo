import type { Meta, StoryObj } from '@storybook/react'

import SettingsDescriptor from './SettingsDescriptor'

const meta: Meta<typeof SettingsDescriptor> = {
  title: 'Components/SettingsDescriptor',
  component: SettingsDescriptor,
  argTypes: {
    title: {
      type: 'string',
      control: 'text',
    },
    description: {
      type: 'string',
      control: 'text',
    },
    content: {
      type: 'string',
      control: 'text',
    },
  },
}

export default meta

type Story = StoryObj<typeof SettingsDescriptor>

export const BasicSettingsDescriptorUsing: Story = {
  args: {
    title: 'Section Title',
    description: 'Section description',
    content: 'Section content',
  },
  render: (args) => <SettingsDescriptor {...args} />,
}

export const SettingsDescriptorUsingNestedTags: Story = {
  args: {
    title: 'Section 2',
    description: 'This section is using nested tags',
    content: (
      <div className="flex flex-col gap-3">
        <h1 className="font-semibold text-ds-pink-tertiary">content items:</h1>
        <ul className="flex flex-col gap-1 underline">
          <li>first item</li>
          <li>second item</li>
        </ul>
      </div>
    ),
  },
  render: (args) => <SettingsDescriptor {...args} />,
}
