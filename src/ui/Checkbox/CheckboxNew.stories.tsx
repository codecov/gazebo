import { Meta, StoryObj } from '@storybook/react'

import { CheckboxNew } from './CheckboxNew'

const meta: Meta<typeof CheckboxNew> = {
  title: 'Components/CheckboxNew',
  component: CheckboxNew,
  argTypes: {
    value: {
      description: 'Controlled state checked status.',
      control: 'boolean',
    },
  },
}
export default meta

type Story = StoryObj<typeof CheckboxNew>

export const Default: Story = {
  render: (args) => (
    <>
      <CheckboxNew {...args} />
    </>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <>
      <CheckboxNew {...args} disabled />
    </>
  ),
}

export const ControlledState: Story = {
  args: {
    checked: true,
  },
  render: (args) => <CheckboxNew {...args} />,
}
