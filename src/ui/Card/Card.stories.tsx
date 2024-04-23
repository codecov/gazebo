import { Meta, StoryObj } from '@storybook/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
} as Meta
export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <CardContent>
        Here is the Card component, you are free to render anything you would
        like here.
      </CardContent>
    </Card>
  ),
}

export const CardWithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>A header can have a title.</CardTitle>
        <CardDescription>And it can have a description.</CardDescription>
      </CardHeader>
      <CardContent>
        The header will place a border between it and the main Card content.
      </CardContent>
    </Card>
  ),
}

export const CardWithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card With Footer</CardTitle>
      </CardHeader>
      <CardContent>
        A footer will similarly have a border between it and the main Card
        content.
      </CardContent>
      <CardFooter>Footer!</CardFooter>
    </Card>
  ),
}

export const CardWithCustomStyles: Story = {
  render: () => (
    <Card className="border-4 border-ds-pink">
      <CardHeader className="border-b-4 border-inherit">
        <CardTitle className="text-ds-blue">Custom Styles</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-5">
        <Card className="flex-1">
          <CardContent className="text-center">
            Using the <code className="bg-ds-gray-secondary">className</code>{' '}
            prop,
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="text-center">
            you can set custom styles!
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="border-t-4 border-inherit text-center">
        But if you&apos;re going to do that, consider adding a{' '}
        <a
          href="https://cva.style/docs/getting-started/variants"
          className="text-ds-blue hover:underline"
        >
          CVA variant
        </a>{' '}
        for the component instead.
      </CardFooter>
    </Card>
  ),
}
