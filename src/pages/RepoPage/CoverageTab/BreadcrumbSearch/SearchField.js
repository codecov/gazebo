import PropTypes from 'prop-types'
import { useState } from 'react'
import { useDebounce } from 'react-use'

import TextInput from 'ui/TextInput'

function SearchField({ searchValue, setSearchValue }) {
  const [search, setSearch] = useState(searchValue)

  useDebounce(
    () => {
      setSearchValue(search)
    },
    500,
    [search]
  )

  return (
    <TextInput
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search for files"
    />
  )
}

SearchField.propTypes = {
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
}

export default SearchField
