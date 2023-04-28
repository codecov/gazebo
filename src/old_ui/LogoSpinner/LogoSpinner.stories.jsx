import LogoSpinner from './LogoSpinner'

export const Spinner = {
  args: {},
}

export const SmallSpinner = {
  args: { ...Spinner.args, size: 20 },
}

export const BigSpinner = {
  args: { ...Spinner.args, size: 200 },
}

export default {
  title: 'old_ui/Components/LogoSpinner',
  component: LogoSpinner,
  argTypes: {
    size: { control: 'number' },
  },
}
