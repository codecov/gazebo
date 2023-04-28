import Button from './Button'

export const NormalButton = {
  args: {
    children: 'Normal button',
  },
}

export const PinkButton = {
  args: {
    children: 'Normal button',
    color: 'pink',
  },
}

export const RedButton = {
  args: {
    children: 'Normal Red button',
    color: 'red',
  },
}

export const GrayButton = {
  args: {
    children: 'Normal Gray button',
    color: 'gray',
  },
}

export const OutlineButton = {
  args: {
    children: 'Outline button',
    variant: 'outline',
  },
}

export const TextButton = {
  args: {
    children: 'Outline button',
    variant: 'text',
  },
}

export default {
  title: 'old_ui/Components/Button',
  component: Button,
}
