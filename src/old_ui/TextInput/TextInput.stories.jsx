/* eslint-disable react/display-name */
import TextInput from './TextInput'

import Icon from '../Icon'

const Template = (args) => {
  return <TextInput {...args} />
}

export const NormalTextInput = {
  render: Template,

  args: {
    placeholder: 'Text placeholder',
  },
}

export const ExtraTextInput = {
  render: Template,

  args: {
    ...NormalTextInput.args,
    embedded: () => <Icon name="search" className="h-full w-full" />,
  },
}

export default {
  title: 'old_ui/Components/TextInput',
  component: TextInput,
}
