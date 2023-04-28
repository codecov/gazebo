import Spinner from './Spinner'

export const NormalSpinner = {}

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
