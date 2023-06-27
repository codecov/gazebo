import type { Meta, StoryObj } from '@storybook/react'

import DateRangePicker from './DateRangePicker'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  argTypes: {
    onChange: {
      action: 'params updated',
    },
  },
}

export default meta

type Story = StoryObj<typeof DateRangePicker>

export const DefaultDateRangePicker: Story = {
  args: {
    startDate: new Date(),
    endDate: undefined,
  },
  argTypes: {
    onChange: {
      action: 'params updated',
    },
  },
  render: (args) => {
    return <DateRangePicker {...args} />
  },
}
