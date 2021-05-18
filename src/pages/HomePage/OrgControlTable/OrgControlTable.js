import PropTypes from 'prop-types'

import OptionButton from 'ui/OptionButton'
import Select from 'ui/Select'
import TextInput from 'ui/TextInput'

const sortItems = [
  'Most recent commit',
  'Least recent commit',
  'Highest coverage',
  'Lowest coverage',
  'Name [A-Z]',
  'Name [Z-A]',
]

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
}) {
  return (
    <div className="flex justify-between h-8 my-4">
      <div className="flex">
        <div className="w-52 mr-2">
          <Select value={sortItem} items={sortItems} onChange={setSortItem} />
        </div>
        <div className="w-52">
          <TextInput
            placeholder="Search"
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>
      <OptionButton
        active={active ? optionButtonOptions[0] : optionButtonOptions[1]}
        onChange={(option) =>
          setActive(option.text === optionButtonOptions[0].text)
        }
        options={optionButtonOptions}
      />
    </div>
  )
}

OrgControlTable.propTypes = {
  sortItem: PropTypes.string.isRequired,
  setSortItem: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  setActive: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
}

export default OrgControlTable
