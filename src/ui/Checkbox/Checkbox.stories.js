import { useForm } from 'react-hook-form'

import Checkbox from './Checkbox'

const Template = (args) => {
  const { register, handleSubmit } = useForm()

  function _handleSubmit(data) {
    console.log(data)
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(_handleSubmit)}>
      <Checkbox {...register('test')} {...args} value="test1" name="test" />
      <button className="text-white mt-1 p-2 rounded bg-gray-500" type="submit">
        Submit!
      </button>
    </form>
  )
}

export const CheckboxStringLabel = Template.bind({})

CheckboxStringLabel.args = {
  label: 'Opt-in this great email',
}

export const NoLabelCheckbox = Template.bind({})

NoLabelCheckbox.args = {}

export const CheckboxHTMLLabel = Template.bind({})

CheckboxHTMLLabel.args = {
  label: (
    <span>
      <span className="font-bold">Amazing</span> <span>newsletter</span>
    </span>
  ),
}

export const CheckboxDisabled = Template.bind({})

CheckboxDisabled.args = {
  label: 'Accept cookies',
  disabled: true,
}

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    actions: {
      handles: ['submit', 'form'],
    },
  },
}
