import TextInput from './TextInput'

export const NormalInput = {
  args: {
    label: 'Name',
    placeholder: 'Write your name',
  },
}

export const NumberInput = {
  args: {
    label: 'Age',
    placeholder: 'Type your age',
    type: 'number',
  },
}

export const InputWithNoLabel = {
  args: {
    placeholder:
      'If no labels, the placeholder will also be used as a label for a11y',
    type: 'number',
  },
}

export const InputWithIcon = {
  args: {
    icon: 'search',
    placeholder: 'Search',
  },
}

export default {
  component: TextInput,
  title: 'Components/TextInput',
}
