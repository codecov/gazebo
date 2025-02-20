import PropTypes from 'prop-types'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import OptionButton from 'ui/OptionButton'

import { displayTypeParameter } from '../constants'

const options = [
  {
    text: 'Code tree',
    displayType: displayTypeParameter.tree,
  },
  {
    text: 'File list',
    displayType: displayTypeParameter.list,
  },
]

function initialState(urlParams) {
  const [treeView, listView] = options
  return urlParams?.displayType ===
    displayTypeParameter.list.toLocaleLowerCase()
    ? listView
    : treeView
}

function DisplayTypeButton({ dataLength, isLoading }) {
  const { params, updateParams } = useLocationParams()
  const [active, setActive] = useState(() => initialState(params))

  function handleOnChange(option) {
    updateParams({ displayType: option.displayType.toLowerCase() })
    setActive(option)
  }

  return (
    <div className="flex items-center gap-4">
      <OptionButton
        active={active.text}
        options={options}
        onChange={(option) => handleOnChange(option)}
      />
      {!isLoading &&
        active?.displayType === displayTypeParameter.list &&
        !!dataLength && <span>{dataLength} total files</span>}
    </div>
  )
}

DisplayTypeButton.propTypes = {
  dataLength: PropTypes.number,
  isLoading: PropTypes.bool,
}

export default DisplayTypeButton
