import { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import Icon from 'ui/Icon'

import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
}
export default meta

type Story = StoryObj<typeof Tooltip>

const DefaultStory: React.FC = () => (
  <Tooltip.Provider delayDuration={0} skipDelayDuration={100}>
    <div className="flex h-screen items-center justify-center">
      <Tooltip>
        <Tooltip.Trigger>
          <p>hover over me</p>
        </Tooltip.Trigger>
        <Tooltip.Content side="top">
          <p>This is the tooltip content with plain text.</p>
          <Tooltip.Arrow />
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
          <button className=" rounded border-2 border-red-700 p-4 text-red-700">
            <Icon name="informationCircle" size="lg" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content side="left" className="bg-gray-100 text-black">
          <div>
            <p>This is the tooltip content with HTML.</p>
            <p>
              It can contain HTML elements like <strong>bold text</strong> and{' '}
              <em>italic text</em>.
            </p>
          </div>
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip>
    </div>
  </Tooltip.Provider>
)

const BottomTooltipStory: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Tooltip.Provider delayDuration={0} skipDelayDuration={500}>
      <div className="flex h-screen items-center justify-center">
        <Tooltip onOpenChange={setIsOpen} open={isOpen}>
          <Tooltip.Trigger>
            <button className="p-4 text-blue-700">
              <Icon name={isOpen ? 'eye' : 'eyeOff'} size="lg" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">
            <p>This is the tooltip content with plain text.</p>
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  )
}

export const Default: Story = {
  render: () => <DefaultStory />,
}

export const WithHtmlContent: Story = {
  render: () => <WithHtmlContentStory />,
}

export const BottomTooltip: Story = {
  render: () => <BottomTooltipStory />,
}
