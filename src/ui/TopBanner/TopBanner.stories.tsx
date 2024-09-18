import type { Meta, StoryObj } from '@storybook/react'

import TopBannerComponent from './index'

const meta: Meta<typeof TopBannerComponent> = {
  title: 'Components/TopBanner',
  component: TopBannerComponent,
  argTypes: {
    localStorageKey: {
      description: 'testing',
      table: {
        disable: true,
      },
    },
    variant: {
      options: ['default', 'warning', 'error'],
      control: 'radio',
      description:
        'This prop controls the variation of top banner that is displayed',
    },
    children: {
      control: 'text',
    },
  },
}

export default meta

type Story = StoryObj<typeof TopBannerComponent>

export const TopBanner: Story = {
  args: {
    variant: 'default',
    children: 'Cool Banner',
  },
  argTypes: {
    variant: {
      options: ['default', 'warning', 'error'],
      control: 'radio',
    },
    children: {
      control: 'text',
    },
  },
  render: (args) => {
    const { variant, children } = args
    return (
      <TopBannerComponent
        localStorageKey="storybook-top-banner"
        variant={variant}
      >
        <TopBannerComponent.Start>{children}</TopBannerComponent.Start>
        <TopBannerComponent.End>{children}</TopBannerComponent.End>
      </TopBannerComponent>
    )
  },
}
