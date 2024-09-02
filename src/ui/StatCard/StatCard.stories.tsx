import { Meta, StoryObj } from '@storybook/react'

import Badge from 'ui/Badge'
import Icon from 'ui/Icon'

import { StatCard } from './StatCard'

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  argTypes: {
    children: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    children: (
      <StatCard>
        <StatCard.Header>
          <StatCard.Title>Total Users</StatCard.Title>
        </StatCard.Header>
        <StatCard.Content>
          1000
          <Badge variant="success">+10%</Badge>
        </StatCard.Content>
        <StatCard.Description>Total number of users</StatCard.Description>
      </StatCard>
    ),
  },
  render: (args) => <StatCard {...args} />,
}

export const WithNegativeChange: Story = {
  args: {
    children: (
      <StatCard>
        <StatCard.Header>
          <StatCard.Title>Revenue</StatCard.Title>
        </StatCard.Header>
        <StatCard.Content>
          $50,000
          <Badge variant="danger">-5%</Badge>
        </StatCard.Content>
        <StatCard.Description>monthly revenue</StatCard.Description>
      </StatCard>
    ),
  },
  render: (args) => <StatCard {...args} />,
}

export const WithIcon: Story = {
  args: {
    children: (
      <StatCard>
        <StatCard.Header>
          <StatCard.Title>New Signups</StatCard.Title>
          <Icon name="informationCircle" size="sm" />
        </StatCard.Header>
        <StatCard.Content>
          250
          <Badge variant="success">+15%</Badge>
        </StatCard.Content>
        <StatCard.Description>new users this week</StatCard.Description>
      </StatCard>
    ),
  },
  render: (args) => <StatCard {...args} />,
}
