import LogoSpinner from './LogoSpinner'

const Template = (args) => <LogoSpinner {...args} />

export const Spinner = Template.bind({})
Spinner.args = {}
export const SmallSpinner = Template.bind({})
SmallSpinner.args = { ...Spinner.args, size: 20 }
export const BigSpinner = Template.bind({})
BigSpinner.args = { ...Spinner.args, size: 200 }

export default {
  title: 'Components/LogoSpinner',
  component: LogoSpinner,
  argTypes: {
    size: { control: 'number' },
  },
}
