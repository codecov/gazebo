import { Meta, StoryObj } from '@storybook/react'

import CopyClipboard from './CopyClipboard'

const meta: Meta<typeof CopyClipboard> = {
  title: 'Components/CopyClipboard',
  component: CopyClipboard,
  argTypes: {
    string: {
      description: "The value to be copied to the clicker's clipboard",
      control: 'text',
      defaultValue: 'asdf',
    },
  },
}
export default meta

type Story = StoryObj<typeof CopyClipboard>

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-8">
      <CopyClipboard {...args} />
      <textarea
        className="border border-solid border-ds-gray"
        rows={4}
        cols={50}
        placeholder="You can paste your clipboard here"
      ></textarea>
    </div>
  ),
}
