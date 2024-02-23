import PropTypes from 'prop-types'
import { useState } from 'react'
import useDebounce from 'react-use/lib/useDebounce'

import OptionButton from 'ui/OptionButton'
import TextInput from 'ui/TextInput'

import RepoOrgNotFound from './RepoOrgNotFound'

const optionButtonOptions = [
  { text: 'All' },
  {
    text: 'Configured',
  },
  {
    text: 'Not Configured',
  },
]

function OrgControlTable({
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
    <div className="m-4 grid grid-cols-2 items-center justify-items-stretch gap-2 sm:mx-0 lg:flex">
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
      {canRefetch && <RepoOrgNotFound />}
    </div>
  )
}

OrgControlTable.propTypes = {
  repoDisplay: PropTypes.string.isRequired,
  setRepoDisplay: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  searchValue: PropTypes.string.isRequired,
  canRefetch: PropTypes.bool.isRequired,
}

export default OrgControlTable
