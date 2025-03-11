import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'

import Toggle from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    label: {
      control: 'text',
    },
    value: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    dataMarketing: {
      control: 'text',
    },
  },
}

export default meta

type Story = StoryObj<typeof Toggle>

export const NormalToggle: Story = {
  render: (args) => {
    const [toggle, setToggle] = useState(false)
    return (
      <Toggle value={toggle} {...args} onClick={() => setToggle(!toggle)} />
    )
  },
}

export const DisabledToggle: Story = {
  args: {
    disabled: true,
  },
  render: (args) => {
    const [toggle, setToggle] = useState(false)
    return (
      <Toggle value={toggle} {...args} onClick={() => setToggle(!toggle)} />
    )
  },
}

export const LoadingToggle: Story = {
  render: (args) => {
    const [toggle, setToggle] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const toggler = async () => {
      setIsLoading(true)
      setTimeout(() => {
        setToggle(!toggle)
        setIsLoading(false)
      }, 2000)
    }
    return (
      <Toggle
        value={toggle}
        isLoading={isLoading}
        {...args}
        onClick={toggler}
      />
    )
  },
}
