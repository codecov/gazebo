import { Meta, StoryObj } from '@storybook/react'

import TotalsNumber from './TotalsNumber'

const meta: Meta<typeof TotalsNumber> = {
  title: 'Components/TotalsNumber',
  component: TotalsNumber,
}

export default meta

type Story = StoryObj<typeof TotalsNumber>

export const NumberWithChange: Story = {
  render: () => <TotalsNumber value={22} showChange={true} />,
}

export const NegativeNumber: Story = {
  render: () => <TotalsNumber value={-39} />,
}

export const LargeNumberWithChange: Story = {
  render: () => <TotalsNumber value={78} large={true} showChange={true} />,
}

export const LargeNegativeNumberWithChange: Story = {
  render: () => <TotalsNumber value={-63} showChange={true} large={true} />,
}

export const PlainLargeNumber: Story = {
  render: () => <TotalsNumber value={78} large={true} plain={true} />,
}

export const LightNumber: Story = {
  render: () => <TotalsNumber value={61} light={true} />,
}

export const NoValue: Story = {
  render: () => <TotalsNumber value={0} />,
}
