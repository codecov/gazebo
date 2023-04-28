import ProgressComponent from './Progress'

export const Progress = {
  args: {
    amount: 50,
  },
}

export const ProgressZero = {
  args: {
    amount: 0,
  },
}

export const ProgressNaN = {
  args: {
    amount: NaN,
  },
}

export const ProgressNull = {
  args: {
    amount: null,
  },
}

export const ProgressUndefined = {
  args: {
    amount: undefined,
  },
}

export const ProgressTall = {
  args: {
    amount: 50,
    variant: 'tall',
  },
}

export const ProgressWithLabel = {
  args: {
    amount: 50,
    label: true,
  },
}

export const ProgressInvalidWithLabel = {
  args: {
    amount: 0,
    label: true,
  },
}

export default {
  title: 'Components/Progress',
  component: ProgressComponent,
  argTypes: {
    color: {
      type: 'select',
      options: ['default', 'neutral', 'danger', 'warning'],
    },
    variant: {
      type: 'select',
      options: ['default', 'tall'],
    },
  },
}
