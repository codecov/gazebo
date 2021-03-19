import { useState } from 'react'
import Toggle from './Toggle'

const Template = (args) => {
  const [toggle, setToggle] = useState(false)
  return <Toggle value={toggle} onClick={() => setToggle(!toggle)} {...args} />
}

export const NormalToggle = Template.bind({})
NormalToggle.args = {
  label: 'sr label',
  labelClass: '',
}

export default {
  title: 'old_ui/Components/Toggle',
  component: Toggle,
}
