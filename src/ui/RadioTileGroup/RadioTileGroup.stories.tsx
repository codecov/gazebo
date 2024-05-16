import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

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
      <RadioTileGroup.Item value="radio" flex={args.flex}>
        <RadioTileGroup.Label>Radio</RadioTileGroup.Label>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item value="tile" flex={args.flex}>
        <RadioTileGroup.Label>Tile</RadioTileGroup.Label>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item value="group" flex={args.flex}>
        <RadioTileGroup.Label>Group</RadioTileGroup.Label>
      </RadioTileGroup.Item>
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
      <RadioTileGroup.Item value="description" flex={args.flex}>
        <RadioTileGroup.Label>Description</RadioTileGroup.Label>
        <RadioTileGroup.Description>
          A RadioTileGroup Item can optionally have a description, which is a
          great way to elaborate on the value of the option.
        </RadioTileGroup.Description>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item value="noDescription" flex={args.flex}>
        <RadioTileGroup.Label>No Description</RadioTileGroup.Label>
      </RadioTileGroup.Item>
    </RadioTileGroup>
  ),
}

export const WithControlledInput: Story = {
  args: {
    direction: 'row',
    flex: 1,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string | undefined>(undefined)

    return (
      <RadioTileGroup
        className="w-full"
        direction={args.direction}
        value={value}
        onValueChange={(value) => {
          setValue(value)
          // controlled input state isn't always required, you can also do things here ... like navigation etc.
        }}
      >
        <RadioTileGroup.Item value="radio" flex={args.flex}>
          <RadioTileGroup.Label>Radio</RadioTileGroup.Label>
        </RadioTileGroup.Item>
        <RadioTileGroup.Item value="tile" flex={args.flex}>
          <RadioTileGroup.Label>Tile</RadioTileGroup.Label>
        </RadioTileGroup.Item>
        <RadioTileGroup.Item value="group" flex={args.flex}>
          <RadioTileGroup.Label>Group</RadioTileGroup.Label>
        </RadioTileGroup.Item>
      </RadioTileGroup>
    )
  },
}
