import type { Meta, StoryObj } from '@storybook/react'

import { icicle } from 'assets/svg/graphs'

import GraphCard from './GraphCard'

const meta: Meta<typeof GraphCard> = {
  title: 'Components/GraphCard',
  component: GraphCard,
}

export default meta

type Story = StoryObj<typeof GraphCard>

export const BasicGraphCard: Story = {
  args: {
    title: 'Graph Title',
    description:
      'Mollit adipisicing aute velit nulla est ut consectetur excepteur nulla sunt. Elit esse sint sint ut laborum ipsum. Ipsum et officia proident magna duis amet. Deserunt eiusmod aute tempor dolore occaecat laboris. Aute dolor aliqua magna dolore occaecat irure eu qui fugiat eu ut non consequat tempor.',
    link: 'https://codecov.io/gh/test',
    src: icicle,
  },
  render: (args) => (
    <div className="grid grid-cols-5">
      <GraphCard {...args} />
    </div>
  ),
}
