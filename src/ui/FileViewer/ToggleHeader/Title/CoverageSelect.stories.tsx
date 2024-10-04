import { Meta, StoryObj } from '@storybook/react'

import { LINE_STATE } from 'shared/utils/fileviewer'

import { CoverageSelect } from './CoverageSelect'

type CoverageSelectStory = React.ComponentProps<typeof CoverageSelect>

const meta: Meta<CoverageSelectStory> = {
  title: 'Components/FileViewer/CoverageSelect',
  component: CoverageSelect,
  argTypes: {
    coverage: {
      description: 'The coverage state of the line',
      control: 'select',
      options: [LINE_STATE.COVERED, LINE_STATE.UNCOVERED, LINE_STATE.PARTIAL],
    },
  },
}

export default meta

type Story = StoryObj<CoverageSelectStory>

export const Default: Story = {
  args: {
    coverage: LINE_STATE.COVERED,
  },
  render: (args) => <CoverageSelect coverage={args.coverage} />,
}

export const Uncovered: Story = {
  args: {
    coverage: LINE_STATE.UNCOVERED,
  },
  render: (args) => <CoverageSelect coverage={args.coverage} />,
}

export const Partial: Story = {
  args: {
    coverage: LINE_STATE.PARTIAL,
  },
  render: (args) => <CoverageSelect coverage={args.coverage} />,
}
