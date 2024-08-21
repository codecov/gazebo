import { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import Icon from 'ui/Icon'

import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
}
export default meta

type Story = StoryObj<typeof Tooltip>

const DefaultStory: React.FC = () => (
  <Tooltip.Provider delayDuration={0} skipDelayDuration={500}>
    <div className="flex h-screen items-center justify-center">
      <Tooltip>
        <Tooltip.Trigger>
          <Icon name="informationCircle" size="lg" />
        </Tooltip.Trigger>
        <Tooltip.Content side="top">
          This is the tooltip content.
        </Tooltip.Content>
      </Tooltip>
    </div>
  </Tooltip.Provider>
)

const WithHtmlContentStory: React.FC = () => (
  <Tooltip.Provider delayDuration={0} skipDelayDuration={500}>
    <div className="flex h-screen items-center justify-center">
      <Tooltip>
        <Tooltip.Trigger>
          <button className="rounded bg-green-500 p-4 text-white">
            <Icon name="informationCircle" size="lg" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">
          <div>
            <p>This is the tooltip content with HTML.</p>
            <p>
              It can contain HTML elements like <strong>bold text</strong> and{' '}
              <em>italic text</em>.
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip>
    </div>
  </Tooltip.Provider>
)

export const Default: Story = {
  render: () => <DefaultStory />,
}

export const WithHtmlContent: Story = {
  render: () => <WithHtmlContentStory />,
}
