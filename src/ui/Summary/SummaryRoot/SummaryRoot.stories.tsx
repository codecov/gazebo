import { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import SummaryRoot from './SummaryRoot'

import SummaryField from '../SummaryField'

const meta: Meta<typeof SummaryRoot> = {
  title: 'Components/Summary/SummaryRoot',
  component: SummaryRoot,
}

export default meta

type Story = StoryObj<typeof SummaryRoot>

export const Default: Story = {
  render: (args) => (
    <SummaryRoot {...args}>
      <SummaryField title="One summary">One summary</SummaryField>
      <SummaryField title="Two summary">Two summary</SummaryField>
      <SummaryField>Summary with no title</SummaryField>
    </SummaryRoot>
  ),
}
