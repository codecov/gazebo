import OptionSelectComponent from './OptionSelect'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

const Template = (args) => {
  const { register } = useForm()
  const [value, setValue] = useState(true)
  console.log('fffhere')
  return (
    <OptionSelectComponent
      onChange={() => setValue(!value)}
      checked={value}
      ref={register}
      {...args}
    />
  )
}

export const DefaultOptionSelect = Template.bind({})

DefaultOptionSelect.args = {}

export const OptionSelectStringLabel = Template.bind({})

OptionSelectStringLabel.args = {
  label: '$10/per user monthly, billed annually',
  variant: 'label',
}

export const OptionSelectHTMLLabel = Template.bind({})

OptionSelectHTMLLabel.args = {
  label: (
    <span>
      <span className="font-bold">$10</span>
      <span>/per user monthly, billed annually</span>
    </span>
  ),
  variant: 'label',
}

export default {
  title: 'Components/OptionSelect',
  component: OptionSelectComponent,
}
