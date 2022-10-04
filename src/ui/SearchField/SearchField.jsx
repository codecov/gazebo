import PropTypes from 'prop-types'
import { forwardRef, useState } from 'react'
import { useDebounce } from 'react-use'

import TextInput from 'ui/TextInput'

const SearchField = forwardRef(
  ({ searchValue, setSearchValue, variant = 'default', ...rest }, ref) => {
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
        variant={variant}
        {...newProps}
        ref={ref}
      />
    )
  }
)

SearchField.displayName = 'SearchField'

SearchField.propTypes = {
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'topRounded']),
}

export default SearchField
