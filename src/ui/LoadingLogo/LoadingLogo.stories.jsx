import LoadingLogo from './LoadingLogo'

const Template = (args) => <LoadingLogo {...args} />

export const NormalLoadingLogo = Template.bind({})

export default {
  title: 'Components/LoadingLogo',
  component: LoadingLogo,
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
