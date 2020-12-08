import Icon from './Icon'

const Template = (args) => <Icon {...args} />

export const SimpleIcon = Template.bind({})
SimpleIcon.args = {
  name: 'check',
}

export const SimpleIconWithColor = Template.bind({})
SimpleIconWithColor.args = {
  ...SimpleIcon.args,
  color: 'text-pink-500',
}

// TODO: display all the icon we have by looping the keys from `import * as svg from './svg'`

export default {
  title: 'Components/Icon',
  component: Icon,
}
