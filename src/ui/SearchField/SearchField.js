import PropTypes from 'prop-types'
import { useState } from 'react'
import { useDebounce } from 'react-use'

import TextInput from 'ui/TextInput'

function SearchField({ searchValue, setSearchValue, ...rest }) {
  const [search, setSearch] = useState(searchValue)
  // eslint-disable-next-line no-unused-vars
  const { className, value, onChange, icon, ...newProps } = rest

  useDebounce(
    () => {
      setSearchValue(search)
    },
    500,
    [search]
  )

  const onChangeHandler = (e) => {
    setSearch(e.target.value)
    if (onChange) {
      onChange(e)
    }
  }

  return (
    <TextInput
      value={search}
      onChange={onChangeHandler}
      icon={icon ?? 'search'}
      {...newProps}
    />
  )
}

SearchField.propTypes = {
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
}

export default SearchField
