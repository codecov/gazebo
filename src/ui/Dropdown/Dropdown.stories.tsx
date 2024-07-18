import { Meta, StoryObj } from '@storybook/react'

import { Dropdown } from './Dropdown'

type DropdownStory = React.ComponentProps<typeof Dropdown>

const meta: Meta<DropdownStory> = {
  title: 'Components/Dropdown',
  component: Dropdown,
} as Meta
export default meta

type Story = StoryObj<DropdownStory>

export const Default: Story = {
  render: () => (
    <Dropdown>
      <Dropdown.Trigger>Open</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item>Apple</Dropdown.Item>
        <Dropdown.Item>Orange</Dropdown.Item>
        <Dropdown.Item>Strawberry</Dropdown.Item>
        <Dropdown.Item>Lemon</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <Dropdown>
      <Dropdown.Trigger>Open</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Label>My Label</Dropdown.Label>
        <Dropdown.Item>Apple</Dropdown.Item>
        <Dropdown.Item>Orange</Dropdown.Item>
        <Dropdown.Item>Strawberry</Dropdown.Item>
        <Dropdown.Item>Lemon</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  ),
}
