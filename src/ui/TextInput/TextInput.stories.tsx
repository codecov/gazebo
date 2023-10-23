import { Meta, StoryObj } from '@storybook/react'

import TextInput from './TextInput'

export default {
  title: 'Components/TextInput',
  component: TextInput,
} as Meta

type Story = StoryObj<typeof TextInput>

export const TextInputWithLabel: Story = {
  args: {
    label: 'Name',
    placeholder: 'Write your name',
  },
  render: (args) => {
    return <TextInput {...args} />
  },
}

export const TextInputWithPlaceholder: Story = {
  args: {
    placeholder: 'Type your age',
    type: 'number',
  },
  render: (args) => {
    return <TextInput {...args} />
  },
}

export const TextInputWithIcon: Story = {
  args: {
    icon: 'search',
    placeholder: 'Search',
  },
  render: (args) => {
    return <TextInput {...args} />
  },
}
