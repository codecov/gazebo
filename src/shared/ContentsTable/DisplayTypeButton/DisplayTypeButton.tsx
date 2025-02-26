import { useState } from 'react'

import { useLocationParams } from 'services/navigation/useLocationParams'
import { OptionButton } from 'ui/OptionButton/OptionButton'

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
] as const
type Options = (typeof options)[number]

// useLocationParams is pain
function initialState(urlParams: any): Options {
  const [treeView, listView] = options
  return urlParams?.displayType ===
    displayTypeParameter.list.toLocaleLowerCase()
    ? listView
    : treeView
}

interface DisplayTypeButtonProps {
  dataLength?: number
  isLoading?: boolean
}

export function DisplayTypeButton({
  dataLength,
  isLoading,
}: DisplayTypeButtonProps) {
  const { params, updateParams } = useLocationParams()
  const [active, setActive] = useState<Options>(() => initialState(params))

  function handleOnChange(option: Options) {
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
      !!dataLength ? (
        <span>{dataLength} total files</span>
      ) : null}
    </div>
  )
}
