import PropTypes from 'prop-types'
import { forwardRef, useEffect, useRef, useState } from 'react'
import * as ReactUse from 'react-use'

import { dataMarketingType } from 'shared/propTypes'
import TextInput from 'ui/TextInput'

const SearchField = forwardRef(
  (
    {
      searchValue,
      setSearchValue,
      variant = 'default',
      dataMarketing,
      ...rest
    },
    ref
  ) => {
    const [search, setSearch] = useState(searchValue)
    const { className, value, onChange, icon, ...newProps } = rest

    // bit of a hack to allow resetting searchValue value from parent.
    const debouncing = useRef(false)
    useEffect(() => {
      debouncing.current = true
    }, [search])

    useEffect(() => {
      if (!debouncing.current && searchValue === '' && search !== '') {
        setSearch(searchValue)
      }
    }, [searchValue, search])

    ReactUse.useDebounce(
      () => {
        setSearchValue(search)
        debouncing.current = false
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
        dataMarketing={dataMarketing}
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
  dataMarketing: dataMarketingType,
}

export default SearchField
