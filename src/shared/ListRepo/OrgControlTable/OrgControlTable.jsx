import PropTypes from 'prop-types'
import { useState } from 'react'
import useDebounce from 'react-use/lib/useDebounce'

import { nonActiveOrderingOptions, orderingOptions } from 'services/repos'
import OptionButton from 'ui/OptionButton'
import Select from 'ui/Select'
import TextInput from 'ui/TextInput'

import GithubPrivateScopeLogin from './GithubPrivateScopeLogin'
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
    <div className="m-4 gap-2 sm:mx-0 grid grid-cols-2 lg:grid-cols-5 items-center justify-items-stretch">
      <Select
        dataMarketing="repo-list-order-selector"
        ariaName="Sort Order"
        value={sortItem}
        items={active ? orderingOptions : nonActiveOrderingOptions}
        onChange={setSortItem}
        renderItem={(option) => option.text}
      />
      <TextInput
        dataMarketing="search-repos-list"
        value={search}
        placeholder="Search"
        onChange={(e) => setSearch(e.target.value)}
        data-testid="org-control-search"
      />
      {canRefetch && <ResyncButton />}
      <GithubPrivateScopeLogin />
      <div className="justify-self-end">
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
