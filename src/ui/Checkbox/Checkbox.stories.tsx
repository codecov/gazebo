import { Meta, StoryObj } from '@storybook/react'

import Checkbox from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    value: {
      description: 'Controlled state checked status.',
      control: 'boolean',
    },
  },
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: (args) => (
    <>
      <Checkbox {...args} />
    </>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <>
      <Checkbox {...args} disabled />
    </>
  ),
}

export const DisabledAndChecked: Story = {
  render: () => (
    <>
      <Checkbox disabled checked={true} />
    </>
  ),
}

export const ControlledState: Story = {
  args: {
    checked: true,
  },
  render: (args) => <Checkbox {...args} />,
}
