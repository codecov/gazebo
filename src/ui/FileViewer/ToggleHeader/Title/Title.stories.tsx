import { Meta, StoryObj } from '@storybook/react'

import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags, TitleHitCount } from './Title'

type TitleStory = React.ComponentProps<typeof Title>

const meta: Meta<TitleStory> = {
  title: 'Components/FileViewer/Title',
  component: Title,
  argTypes: {
    title: {
      description: 'The title of the file viewer',
      control: 'text',
    },
    sticky: {
      description: 'Whether the title should be sticky',
      control: 'boolean',
    },
    children: {
      description: 'The children of the title',
      control: 'text',
    },
  },
}

export default meta

type Story = StoryObj<TitleStory>

export const Default: Story = {
  args: {
    title: 'Super Cool Title',
  },
  render: (args) => {
    return (
      <Title {...args}>
        <TitleHitCount showHitCount={true} />
        <TitleCoverage coverage={LINE_STATE.COVERED} />
        <TitleCoverage coverage={LINE_STATE.PARTIAL} />
        <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
        <TitleFlags />
      </Title>
    )
  },
}
