import { type Meta, type StoryObj } from '@storybook/react'

import LoadingLogo from './LoadingLogo'

const meta: Meta<typeof LoadingLogo> = {
  title: 'Components/LoadingLogo',
  component: LoadingLogo,
}

export default meta

type Story = StoryObj<typeof LoadingLogo>

export const NormalLoadingLogo: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0E1B29' },
        { name: 'light', value: '#F7F8FB' },
      ],
    },
  },
}
