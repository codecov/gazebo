import PropTypes from 'prop-types'
import { useState } from 'react'
import useDebounce from 'react-use/lib/useDebounce'

import { nonActiveOrderingOptions, orderingOptions } from 'services/repos'
import OptionButton from 'ui/OptionButton'
import Select from 'ui/Select'
import TextInput from 'ui/TextInput'

import GithubPrivateScopeLogin from './GithubPrivateScopeLogin'
import ResyncButton from './ResyncButton'

import { repoDisplayOptions } from '../ListRepo'

const optionButtonOptions = [
  { text: 'All' },
  {
    text: 'Active',
  },
  {
    text: 'Inactive',
  },
]

function OrgControlTable({
  sortItem,
  setSortItem,
  repoDisplay,
  setRepoDisplay,
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
    <div className="m-4 gap-2 sm:mx-0 grid grid-cols-2 lg:flex items-center justify-items-stretch">
      <OptionButton
        active={repoDisplay}
        onChange={(option) => setRepoDisplay(option.text)}
        options={optionButtonOptions}
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
      <Select
        dataMarketing="repo-list-order-selector"
        ariaName="Sort Order"
        value={sortItem}
        items={
          repoDisplay === repoDisplayOptions.ACTIVE.text
            ? orderingOptions
            : nonActiveOrderingOptions
        }
        onChange={setSortItem}
        renderItem={(option) => option.text}
      />
    </div>
  )
}

OrgControlTable.propTypes = {
  sortItem: PropTypes.object.isRequired,
  setSortItem: PropTypes.func.isRequired,
  repoDisplay: PropTypes.string.isRequired,
  setRepoDisplay: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  searchValue: PropTypes.string.isRequired,
  canRefetch: PropTypes.bool.isRequired,
}

export default OrgControlTable
