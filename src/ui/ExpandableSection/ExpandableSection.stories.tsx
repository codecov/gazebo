import { Meta, StoryObj } from '@storybook/react'

import { ExpandableSection } from './ExpandableSection'

const meta: Meta<typeof ExpandableSection> = {
  title: 'Components/ExpandableSection',
  component: ExpandableSection,
}
export default meta

type Story = StoryObj<typeof ExpandableSection>

export const Default: Story = {
  render: () => (
    <ExpandableSection>
      <ExpandableSection.Trigger>Expandable Section</ExpandableSection.Trigger>
      <ExpandableSection.Content>
        This is the content of the expandable section.
      </ExpandableSection.Content>
    </ExpandableSection>
  ),
}

export const WithHtmlContent: Story = {
  render: () => (
    <ExpandableSection>
      <ExpandableSection.Trigger>
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
  ),
}
