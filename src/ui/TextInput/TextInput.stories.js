import TextInput from './TextInput'

const Template = (args) => <TextInput {...args} />

export const NormalInput = Template.bind({})
NormalInput.args = {
  label: 'Name',
  placeholder: 'Write your name',
}

export const NumberInput = Template.bind({})
NumberInput.args = {
  label: 'Age',
  placeholder: 'Type your age',
  type: 'number',
}

export const InputWithNoLabel = Template.bind({})
InputWithNoLabel.args = {
  placeholder:
    'If no labels, the placeholder will also be used as a label for a11y',
  type: 'number',
}

export const InputWithIcon = Template.bind({})
InputWithIcon.args = {
  placeholder: 'Search',
  icon: 'search',
}

export default {
  title: 'Components/TextInput',
  component: TextInput,
}
