import TextInput from './TextInput'

const Template = (args) => <TextInput {...args} />

export const NormalTextInput = Template.bind({})
NormalTextInput.args = {
  placeholder: 'Text placeholder',
}

export default {
  title: 'Components/TextInput',
  component: TextInput,
}
