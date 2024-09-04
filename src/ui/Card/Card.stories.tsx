import { Meta, StoryObj } from '@storybook/react'

import { Card } from './Card'

// Hack to allow us to specify args that do not exist on Card
type CardStory = React.ComponentProps<typeof Card> & {
  titleSize?: 'lg' | 'base'
}

const meta: Meta<CardStory> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    titleSize: {
      description: 'Controls the font size of Card.Title',
      control: 'radio',
      options: ['lg', 'base'],
    },
  },
} as Meta
export default meta

type Story = StoryObj<CardStory>

export const Default: Story = {
  render: () => (
    <Card>
      <Card.Content>
        Here is the Card component, you are free to render anything you would
        like here.
      </Card.Content>
    </Card>
  ),
}

export const CardWithHeader: Story = {
  args: {
    titleSize: 'lg',
  },
  render: (args) => (
    <Card>
      <Card.Header>
        <Card.Title size={args.titleSize}>
          A header can have a title.
        </Card.Title>
        <Card.Description>And it can have a description.</Card.Description>
      </Card.Header>
      <Card.Content>
        The header will place a border between it and the main Card content.
      </Card.Content>
    </Card>
  ),
}

export const CardWithFooter: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Card With Footer</Card.Title>
      </Card.Header>
      <Card.Content>
        A footer will similarly have a border between it and the main Card
        content.
      </Card.Content>
      <Card.Footer>Footer!</Card.Footer>
    </Card>
  ),
}

export const CardWithCustomStyles: Story = {
  render: () => (
    <Card className="border-4 border-ds-pink-default">
      <Card.Header className="border-b-4 border-inherit">
        <Card.Title className="text-ds-blue-default">Custom Styles</Card.Title>
      </Card.Header>
      <Card.Content className="flex gap-5">
        <Card className="flex-1">
          <Card.Content className="text-center">
            Using the <code className="bg-ds-gray-secondary">className</code>{' '}
            prop,
          </Card.Content>
        </Card>
        <Card className="flex-1">
          <Card.Content className="text-center">
            you can set custom styles!
          </Card.Content>
        </Card>
      </Card.Content>
      <Card.Footer className="border-t-4 border-inherit text-center">
        But if you&apos;re going to do that, consider adding a{' '}
        <a
          href="https://cva.style/docs/getting-started/variants"
          className="text-ds-blue-default hover:underline"
        >
          CVA variant
        </a>{' '}
        for the component instead.
      </Card.Footer>
    </Card>
  ),
}
