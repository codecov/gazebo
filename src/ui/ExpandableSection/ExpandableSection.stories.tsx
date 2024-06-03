import { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { ExpandableSection } from './ExpandableSection'

const meta: Meta<typeof ExpandableSection> = {
  title: 'Components/ExpandableSection',
  component: ExpandableSection,
}
export default meta

type Story = StoryObj<typeof ExpandableSection>

const DefaultStory: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <ExpandableSection>
      <ExpandableSection.Trigger
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Expandable Section
      </ExpandableSection.Trigger>
      <ExpandableSection.Content>
        This is the content of the expandable section.
      </ExpandableSection.Content>
    </ExpandableSection>
  )
}

const WithHtmlContentStory: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <ExpandableSection>
      <ExpandableSection.Trigger
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Expandable Section with HTML
      </ExpandableSection.Trigger>
      <ExpandableSection.Content>
        <div>
          <p>This is the content of the expandable section.</p>
          <p>
            It can contain HTML elements like <strong>bold text</strong> and{' '}
            <em>italic text</em>.
          </p>
        </div>
      </ExpandableSection.Content>
    </ExpandableSection>
  )
}

export const Default: Story = {
  render: () => <DefaultStory />,
}

export const WithHtmlContent: Story = {
  render: () => <WithHtmlContentStory />,
}
