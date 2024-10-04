import { Meta, StoryObj } from '@storybook/react'

import { Alert, AlertOptions } from './Alert'

type AlertStory = React.ComponentProps<typeof Alert>

const meta = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: {
      description: 'Controls the styling of the Alert component',
      options: [
        AlertOptions.ERROR,
        AlertOptions.INFO,
        AlertOptions.SUCCESS,
        AlertOptions.WARNING,
      ],
      defaultValue: AlertOptions.INFO,
    },
    customIconName: {
      description: 'Optionally overrides the icon on the Alert',
    },
  },
} as Meta
export default meta

type Story = StoryObj<AlertStory>

export const NoHeader: Story = {
  render: () => (
    <Alert>
      <Alert.Description>
        This is what an alert looks like without a header
      </Alert.Description>
    </Alert>
  ),
}

export const AlertInfo: Story = {
  args: {
    variant: AlertOptions.INFO,
  },
  render: (args) => (
    <Alert variant={args.variant}>
      <Alert.Title>Sample Alert Title</Alert.Title>
      <Alert.Description>
        This is what a sample alert description looks like
      </Alert.Description>
    </Alert>
  ),
}

export const AlertError: Story = {
  args: {
    variant: AlertOptions.ERROR,
  },
  render: (args) => (
    <Alert variant={args.variant}>
      <Alert.Title>You have a failed payment on XYZ</Alert.Title>
      <Alert.Description>
        You better fix it or we will be coming for you!
      </Alert.Description>
    </Alert>
  ),
}

export const AlertSuccess: Story = {
  args: {
    variant: AlertOptions.SUCCESS,
  },
  render: (args) => (
    <Alert variant={args.variant}>
      <Alert.Title>Plan updated successfully</Alert.Title>
      <Alert.Description>
        Thanks for continuing to support your friends at CodeCov!
      </Alert.Description>
    </Alert>
  ),
}

export const AlertWarning: Story = {
  args: {
    variant: AlertOptions.WARNING,
  },
  render: (args) => (
    <Alert variant={args.variant}>
      <Alert.Title>Missing uploads on HEAD</Alert.Title>
      <Alert.Description>
        Try adding an upload manually or using the CLI commands from the docs.
      </Alert.Description>
    </Alert>
  ),
}

export const AlertInfoWithCustomIcon: Story = {
  args: {
    variant: AlertOptions.INFO,
  },
  render: (args) => (
    <Alert variant={args.variant} customIconName="speakerphone">
      <Alert.Title>Sample Alert Title</Alert.Title>
      <Alert.Description>
        This is what a sample alert description looks like
      </Alert.Description>
    </Alert>
  ),
}
