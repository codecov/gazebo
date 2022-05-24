import TokenWrapper from './TokenWrapper'

const Template = (args) => <TokenWrapper {...args} />

export const TokenModel = Template.bind({})
TokenModel.args = {
  token: 'randomTokenCopyMe',
}

export default {
  title: 'Components/TokenWrapper',
  component: TokenWrapper,
}
