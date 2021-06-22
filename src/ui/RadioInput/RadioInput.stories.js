import RadioInput from './RadioInput'
import { useForm } from 'react-hook-form'

const Template = (args) => {
  const { register, handleSubmit } = useForm()

  function _handleSubmit(data) {
    console.log(data)
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(_handleSubmit)}>
      <RadioInput {...register('test')} {...args} value="test1" name="test" />
      <div>
        <input
          id="secondaryRadio"
          className="mr-2"
          type="radio"
          {...register('test')}
          {...args}
          value="test2"
          name="test"
        />
        <label htmlFor="secondaryRadio">This is a test label</label>
      </div>
      <button className="text-white mt-1 p-2 rounded bg-gray-500" type="submit">
        Submit!
      </button>
    </form>
  )
}

export const RadioInputStringLabel = Template.bind({})

RadioInputStringLabel.args = {
  label: '$10/per user monthly, billed annually',
}

export const NoLabelRadioInput = Template.bind({})

NoLabelRadioInput.args = {}

export const RadioInputHTMLLabel = Template.bind({})

RadioInputHTMLLabel.args = {
  label: (
    <span>
      <span className="font-bold">$10</span>
      <span>/per user monthly, billed annually</span>
    </span>
  ),
}

export const RadioInputDisabled = Template.bind({})

RadioInputDisabled.args = {
  label: (
    <span>
      <span className="font-bold">$10</span>
      <span>/per user monthly, billed annually</span>
    </span>
  ),
  disabled: true,
}

export default {
  title: 'Components/RadioInput',
  component: RadioInput,
  parameters: {
    actions: {
      handles: ['submit', 'form'],
    },
  },
}
