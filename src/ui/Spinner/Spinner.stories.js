import Spinner from './Spinner'

const Template = (args) => <Spinner {...args} />

export const NormalSpinner = Template.bind({})

export default {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0E1B29' },
        { name: 'light', value: '#F7F8FB' },
      ],
    },
  },
}
