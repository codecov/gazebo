import Icon from './Icon'
import * as svg from './svg'

const options = Object.keys(svg)

export const SimpleIcon = {
  args: {
    name: 'check',
  },
}

export const SimpleIconWithColor = {
  args: {
    ...SimpleIcon.args,
    color: 'text-pink-500',
  },
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
