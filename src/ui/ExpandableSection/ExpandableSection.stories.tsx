import { Meta, StoryObj } from '@storybook/react'

import ExpandableSection from './ExpandableSection'

type ExpandableSectionStory = {
  title: string
  children: React.ReactNode
}

const meta: Meta<ExpandableSectionStory> = {
  title: 'Components/ExpandableSection',
  component: ExpandableSection,
  argTypes: {
    title: {
      description: 'Title of the expandable section',
      control: 'text',
    },
    children: {
      description: 'Content of the expandable section',
      control: 'text',
    },
  },
}
export default meta

type Story = StoryObj<ExpandableSectionStory>

export const Default: Story = {
  args: {
    title: 'Expandable Section',
    children: 'This is the content of the expandable section.',
  },
  render: (args) => <ExpandableSection {...args} />,
}

export const WithHtmlContent: Story = {
  args: {
    title: 'Expandable Section with HTML',
    children: (
      <div>
        <p>This is the content of the expandable section.</p>
        <p>
          It can contain HTML elements like <strong>bold text</strong> and{' '}
          <em>italic text</em>.
        </p>
      </div>
    ),
  },
  render: (args) => <ExpandableSection {...args} />,
}
