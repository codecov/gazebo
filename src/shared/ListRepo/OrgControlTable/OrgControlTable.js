import { useState } from 'react'
import PropTypes from 'prop-types'
import useDebounce from 'react-use/lib/useDebounce'

import OptionButton from 'ui/OptionButton'
import Select from 'ui/Select'
import TextInput from 'ui/TextInput'
import { orderingOptions, nonActiveOrderingOptions } from 'services/repos'

import ResyncButton from './ResyncButton'

const optionButtonOptions = [
  {
    text: 'Enabled',
  },
  {
    text: 'Not yet setup',
  },
]

function OrgControlTable({
  sortItem,
  setSortItem,
  active,
  setActive,
  setSearchValue,
  searchValue,
  canRefetch,
}) {
  const [search, setSearch] = useState(searchValue)

  useDebounce(
    () => {
      setSearchValue(search)
    },
    500,
    [search]
  )

  return (
    <div className="flex items-center h-8 my-4">
      <div className="flex">
        <div className="w-52 mr-2">
          <Select
            value={sortItem}
            items={active ? orderingOptions : nonActiveOrderingOptions}
            onChange={setSortItem}
            renderItem={(option) => option.text}
          />
        </div>
        <div className="w-52 mr-2">
          <TextInput
            value={search}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {canRefetch && <ResyncButton />}
      <div className="ml-auto">
        <OptionButton
          active={active ? optionButtonOptions[0] : optionButtonOptions[1]}
          onChange={(option) =>
            setActive(option.text === optionButtonOptions[0].text)
          }
          options={optionButtonOptions}
        />
      </div>
    </div>
  )
}

OrgControlTable.propTypes = {
  sortItem: PropTypes.object.isRequired,
  setSortItem: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  setActive: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  searchValue: PropTypes.string.isRequired,
  canRefetch: PropTypes.bool.isRequired,
}

export default OrgControlTable
