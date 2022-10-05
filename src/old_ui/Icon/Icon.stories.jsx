import Icon from './Icon'
import * as svg from './svg'

const options = Object.keys(svg)

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

export default {
  title: 'old_ui/Components/Icon',
  component: Icon,
  argTypes: { name: { control: { type: 'select', options } } },
  decorators: [
    (Story) => (
      <div style={{ width: '25%' }}>
        <Story />
      </div>
    ),
  ],
}
