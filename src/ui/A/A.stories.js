import A from './A'
import Icon from '../Icon'

const Template = (args) => <A {...args} />

export const NormalA = Template.bind({})
NormalA.args = {
  children: 'Normal A',
}

export const MixedA = Template.bind({})
MixedA.args = {
  children: (
    <>
      Mixed content <Icon name="search" size="sm" />
    </>
  ),
}

export default {
  title: 'Components/A',
  component: A,
  argTypes: { onClick: { action: 'clicked' } },
}
