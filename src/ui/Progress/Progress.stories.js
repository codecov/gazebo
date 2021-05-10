import ProgressComponent from './Progress'

const Template = (args) => <Progress {...args} />

export const Progress = Template.bind({})

Progress.args = {
  amount: 80,
}

export const Progress2 = Template.bind({})

Progress2.args = {
  amount: 80,
}

export default {
  title: 'Components/Progress',
  component: ProgressComponent,
}
