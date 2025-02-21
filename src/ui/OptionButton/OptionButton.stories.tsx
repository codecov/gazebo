import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { OptionButton } from './OptionButton'

type OptionButtonStory = React.ComponentProps<typeof OptionButton>

const meta: Meta<OptionButtonStory> = {
  title: 'Components/OptionButton',
  component: OptionButton,
} as Meta
export default meta

type Story = StoryObj<OptionButtonStory>

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState<'Orym' | 'Chetney' | 'Imogen'>(
      'Chetney'
    )
    return (
      <OptionButton
        active={active}
        options={
          [{ text: 'Orym' }, { text: 'Chetney' }, { text: 'Imogen' }] as const
        }
        onChange={(option) => setActive(option.text)}
      />
    )
  },
}
