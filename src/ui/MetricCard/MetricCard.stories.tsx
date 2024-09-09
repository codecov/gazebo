import { Meta, StoryObj } from '@storybook/react'

import Badge from 'ui/Badge'
import Icon from 'ui/Icon'

import { MetricCard } from './MetricCard'

const meta: Meta<typeof MetricCard> = {
  title: 'Components/MetricCard',
  component: MetricCard,
  argTypes: {
    children: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof MetricCard>

export const Default: Story = {
  args: {
    children: (
      <MetricCard>
        <MetricCard.Header>
          <MetricCard.Title>Total Users</MetricCard.Title>
        </MetricCard.Header>
        <MetricCard.Content>
          1000
          <Badge variant="success">+10%</Badge>
        </MetricCard.Content>
        <MetricCard.Description>Total number of users</MetricCard.Description>
      </MetricCard>
    ),
  },
  render: (args) => <MetricCard {...args} />,
}

export const WithNegativeChange: Story = {
  args: {
    children: (
      <MetricCard>
        <MetricCard.Header>
          <MetricCard.Title>Revenue</MetricCard.Title>
        </MetricCard.Header>
        <MetricCard.Content>
          $50,000
          <Badge variant="danger">-5%</Badge>
        </MetricCard.Content>
        <MetricCard.Description>monthly revenue</MetricCard.Description>
      </MetricCard>
    ),
  },
  render: (args) => <MetricCard {...args} />,
}

export const WithIcon: Story = {
  args: {
    children: (
      <MetricCard>
        <MetricCard.Header>
          <MetricCard.Title>New Signups</MetricCard.Title>
          <Icon name="informationCircle" size="sm" />
        </MetricCard.Header>
        <MetricCard.Content>
          250
          <Badge variant="success">+15%</Badge>
        </MetricCard.Content>
        <MetricCard.Description>new users this week</MetricCard.Description>
      </MetricCard>
    ),
  },
  render: (args) => <MetricCard {...args} />,
}
