import type { Meta, StoryObj } from '@storybook/react'

import SummaryField from './SummaryField'

const meta: Meta<typeof SummaryField> = {
  title: 'Components/Summary/SummaryField',
  component: SummaryField,
  argTypes: {
    title: {
      control: 'text',
    },
    children: {
      control: 'text',
    },
  },
}

export default meta

type Story = StoryObj<typeof SummaryField>

export const DefaultSummaryField: Story = {
  args: {
    title: 'Sample title',
    children: <span>Simple markup</span>,
  },
  render: (args) => <SummaryField {...args} />,
}

export const SummaryFieldNoTitle: Story = {
  args: {
    title: null,
    children: <span>Simple markup</span>,
  },
  render: (args) => <SummaryField {...args} />,
}

export const SummaryFieldNoChildren: Story = {
  args: {
    title: 'Another sample title',
    children: null,
  },
  render: (args) => <SummaryField {...args} />,
}
