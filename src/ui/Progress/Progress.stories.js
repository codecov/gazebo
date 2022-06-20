import ProgressComponent from './Progress'

const Template = (args) => <ProgressComponent {...args} />

export const Progress = Template.bind({})

Progress.args = {
  amount: 50,
}

export const ProgressZero = Template.bind({})

ProgressZero.args = {
  amount: 0,
}

export const ProgressNaN = Template.bind({})

ProgressNaN.args = {
  amount: NaN,
}

export const ProgressNull = Template.bind({})

ProgressNull.args = {
  amount: null,
}

export const ProgressUndefined = Template.bind({})

ProgressUndefined.args = {
  amount: undefined,
}

export const ProgressTall = Template.bind({})

ProgressTall.args = {
  amount: 50,
  variant: 'tall',
}

export const ProgressWithLabel = Template.bind({})

ProgressWithLabel.args = {
  amount: 50,
  label: true,
}

export const ProgressInvalidWithLabel = Template.bind({})

ProgressInvalidWithLabel.args = {
  amount: 0,
  label: true,
}

export default {
  title: 'Components/Progress',
  component: ProgressComponent,
  argTypes: {
    color: {
      type: 'select',
      options: ['default', 'neutral', 'danger'],
    },
    variant: {
      type: 'select',
      options: ['default', 'tall'],
    },
  },
}
