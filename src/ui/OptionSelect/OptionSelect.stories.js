import OptionSelectComponent from './OptionSelect'

const Template = (args) => {
  return <OptionSelectComponent {...args} />
}

export const DefaultOptionSelect = Template.bind({})

DefaultOptionSelect.args = {
  value: true,
}

export const OptionSelectStringLabel = Template.bind({})

let value_1 = false
OptionSelectStringLabel.args = {
  label: '$10/per user monthly, billed annually',
  value: value_1,
  variant: 'label',
  onChange: (val) => (value_1 = !val),
}

export const OptionSelectHTMLLabel = Template.bind({})

let value_2 = false
OptionSelectHTMLLabel.args = {
  label: (
    <span>
      <span className="font-bold">$10</span>
      <span>/per user monthly, billed annually</span>
    </span>
  ),
  value: value_2,
  variant: 'label',
  onChange: (val) => (value_2 = !val),
}

export default {
  title: 'Components/OptionSelect',
  component: OptionSelectComponent,
}
