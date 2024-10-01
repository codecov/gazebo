import type { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'

import RadioInput from './RadioInput'

const meta: Meta<typeof RadioInput> = {
  title: 'Components/RadioInput',
  component: RadioInput,
  parameters: {
    actions: {
      handles: ['submit', 'form'],
    },
  },
}

export default meta

type Story = StoryObj<typeof RadioInput>

export const RadioInputStringLabel: Story = {
  args: {
    label: '$10/per user monthly, billed annually',
  },
  render: (args) => {
    const { register, handleSubmit } = useForm()

    function _handleSubmit(data: any) {
      console.log(data)
    }

    return (
      <form className="flex flex-col" onSubmit={handleSubmit(_handleSubmit)}>
        <RadioInput {...register('test')} {...args} value="test1" name="test" />
        <button
          className="mt-1 rounded bg-ds-gray-quinary p-2 text-white"
          type="submit"
        >
          Submit!
        </button>
      </form>
    )
  },
}

export const NoLabelRadioInput: Story = {
  render: (args) => {
    const { register, handleSubmit } = useForm()

    function _handleSubmit(data: any) {
      console.log(data)
    }

    return (
      <form className="flex flex-col" onSubmit={handleSubmit(_handleSubmit)}>
        <RadioInput {...register('test')} {...args} value="test1" name="test" />
        <button
          className="mt-1 rounded bg-ds-gray-quinary p-2 text-white"
          type="submit"
        >
          Submit!
        </button>
      </form>
    )
  },
}

export const RadioInputHTMLLabel: Story = {
  args: {
    label: (
      <span>
        <span className="font-bold">$10</span>
        <span>/per user monthly, billed annually</span>
      </span>
    ),
  },
  render: (args) => {
    const { register, handleSubmit } = useForm()

    function _handleSubmit(data: any) {
      console.log(data)
    }

    return (
      <form className="flex flex-col" onSubmit={handleSubmit(_handleSubmit)}>
        <RadioInput {...register('test')} {...args} value="test1" name="test" />
        <button
          className="mt-1 rounded bg-ds-gray-quinary p-2 text-white"
          type="submit"
        >
          Submit!
        </button>
      </form>
    )
  },
}

export const RadioInputDisabled: Story = {
  args: {
    label: (
      <span>
        <span className="font-bold">$10</span>
        <span>/per user monthly, billed annually</span>
      </span>
    ),
    disabled: true,
  },
  render: (args) => {
    const { register, handleSubmit } = useForm()

    function _handleSubmit(data: any) {
      console.log(data)
    }

    return (
      <form className="flex flex-col" onSubmit={handleSubmit(_handleSubmit)}>
        <RadioInput {...register('test')} {...args} value="test1" name="test" />
        <button
          className="mt-1 rounded bg-ds-gray-quinary p-2 text-white"
          type="submit"
        >
          Submit!
        </button>
      </form>
    )
  },
}
