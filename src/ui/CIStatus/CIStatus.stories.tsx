import type { Meta, StoryObj } from '@storybook/react'

import CIStatus from './CIStatus'

const meta: Meta<typeof CIStatus> = {
  title: 'Components/CIStatus',
  component: CIStatus,
}

export default meta

type Story = StoryObj<typeof CIStatus>

export const Passing: Story = {
  args: { ciPassed: true },
  render: (args) => <CIStatus {...args} />,
}

export const Failing: Story = {
  args: { ciPassed: false },
  render: (args) => <CIStatus {...args} />,
}

export const NoStatus: Story = {
  args: { ciPassed: null },
  render: (args) => <CIStatus {...args} />,
}
