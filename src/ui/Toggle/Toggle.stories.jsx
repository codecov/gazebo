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

export const DisabledToggle = Template.bind({ disabled: true })
DisabledToggle.args = {
  label: 'sr label',
  labelClass: '',
  disabled: true,
}

export default {
  title: 'Components/Toggle',
  component: Toggle,
}
