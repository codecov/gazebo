import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import OptionButton from 'ui/OptionButton'

import useRepoContentsTable from '../subroute/RepoContents/hooks'

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
  const { data } = useRepoContentsTable()
  const { updateParams } = useLocationParams()
  const [active, setActive] = useState(true)

  function handleOnChange(option) {
    updateParams({ displayType: option.displayType })
    setActive(option.text === options[0].text)
  }

  return (
    <div className="flex gap-4 items-center">
      <OptionButton
        active={active ? options[0] : options[1]}
        options={options}
        onChange={(option) => handleOnChange(option)}
      />
      {!active && data && <span>{data?.length} files</span>}
    </div>
  )
}

export default DisplayTypeButton
