import ProgressComponent from './Progress'

const Template = (args) => <ProgressComponent {...args} />

export const Progress = Template.bind({})

Progress.args = {
  amount: 50,
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
