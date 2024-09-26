import { type Meta, type StoryObj } from '@storybook/react'

import TokenWrapper from './TokenWrapper'

const meta: Meta<typeof TokenWrapper> = {
  title: 'Components/TokenWrapper',
  component: TokenWrapper,
  argTypes: {
    truncate: {
      description: 'Truncate the token',
      control: 'boolean',
    },
    token: {
      description: 'The token to be displayed',
      control: 'text',
    },
  },
}

export default meta

type Story = StoryObj<typeof TokenWrapper>

export const Default: Story = {
  render: (args) => <TokenWrapper {...args} />,
  args: {
    token: 'randomTokenCopyMe',
  },
}
