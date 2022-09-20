import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import OptionButton from 'ui/OptionButton'

const options = [
  {
    text: 'Code tree',
    displayType: 'tree',
  },
  {
    text: 'File list',
    displayType: 'list',
  },
]

function DisplayTypeButton() {
  const { updateParams } = useLocationParams()
  const [active, setActive] = useState(true)

  function handleOnChange(option) {
    updateParams({ displayType: option.displayType })
    setActive(option.text === options[0].text)
  }

  return (
    <OptionButton
      active={active ? options[0] : options[1]}
      options={options}
      onChange={(option) => handleOnChange(option)}
    />
  )
}

export default DisplayTypeButton
