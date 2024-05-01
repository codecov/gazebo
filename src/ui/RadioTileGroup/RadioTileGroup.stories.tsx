import { Meta, StoryObj } from '@storybook/react'

import { RadioTileGroup } from './RadioTileGroup'

type RadioTileGroupStory = React.ComponentProps<typeof RadioTileGroup> & {
  flex: 1 | 'none'
}

const meta: Meta<RadioTileGroupStory> = {
  title: 'Components/RadioTileGroup',
  component: RadioTileGroup,
  argTypes: {
    direction: {
      description: 'Controls the flex direction of the RadioTileGroup',
      control: 'radio',
      options: ['row', 'col'],
    },
    flex: {
      description: 'Toggles between the item flexing and not',
      control: 'radio',
      options: [1, 'none'],
    },
  },
}
export default meta

type Story = StoryObj<RadioTileGroupStory>

export const Default: Story = {
  args: {
    direction: 'row',
    flex: 1,
  },
  render: (args) => (
    <RadioTileGroup className="w-full" direction={args.direction}>
      <RadioTileGroup.Item value="radio" label="Radio" flex={args.flex} />
      <RadioTileGroup.Item value="tile" label="Tile" flex={args.flex} />
      <RadioTileGroup.Item value="group" label="Group" flex={args.flex} />
    </RadioTileGroup>
  ),
}

export const WithDescription: Story = {
  args: {
    direction: 'row',
    flex: 1,
  },
  render: (args) => (
    <RadioTileGroup className="w-full" direction={args.direction}>
      <RadioTileGroup.Item
        value="description"
        label="Description"
        description="A RadioTileGroup Item can optionally have a description"
      />
      <RadioTileGroup.Item value="noDescription" label="No Description" />
    </RadioTileGroup>
  ),
}
