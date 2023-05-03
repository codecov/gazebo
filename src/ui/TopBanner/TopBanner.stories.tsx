import type { ComponentMeta, ComponentStory } from '@storybook/react'

import TopBannerComponent from './index'

const meta = {
  title: 'Components/TopBanner',
  component: TopBannerComponent,
} as ComponentMeta<typeof TopBannerComponent>

export default meta

export const TopBanner: ComponentStory<typeof TopBannerComponent> = (args) => (
  <TopBannerComponent {...args}>
    <TopBannerComponent.Content>Cool Banner</TopBannerComponent.Content>
  </TopBannerComponent>
)

export const TopBannerWithDismissButton: ComponentStory<
  typeof TopBannerComponent
> = (args) => (
  <TopBannerComponent {...args}>
    <TopBannerComponent.Content>Cool Banner</TopBannerComponent.Content>
    <TopBannerComponent.ButtonGroup>
      <TopBannerComponent.DismissButton>
        Dismiss
      </TopBannerComponent.DismissButton>
    </TopBannerComponent.ButtonGroup>
  </TopBannerComponent>
)
