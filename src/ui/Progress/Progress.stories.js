import ProgressComponent from './Progress'

const Template = (args) => <ProgressComponent {...args} />

export const Progress = Template.bind({})

Progress.args = {
  amount: 50,
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
    variant: {
      type: 'select',
      options: ['default', 'neutral', 'danger'],
    },
  },
}
