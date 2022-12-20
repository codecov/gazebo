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
    <div className="flex lg:items-center h-auto my-4 mx-4 gap-2 md:mx-0 flex-col lg:flex-row">
      <div className="flex flex-wrap lg:justify-center sm:flex-nowrap gap-2">
        <div className="basis-52">
          <Select
            dataMarketing="repo-list-order-selector"
            ariaName="Sort Order"
            value={sortItem}
            items={active ? orderingOptions : nonActiveOrderingOptions}
            onChange={setSortItem}
            renderItem={(option) => option.text}
          />
        </div>
        <div className="basis-52">
          <TextInput
            dataMarketing="search-repos-list"
            value={search}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            data-testid="org-control-search"
          />
        </div>
      </div>
      <span className="flex flex-auto gap-4 mt-2 lg:m-0 flex-wrap md:flex-nowrap justify-between">
        {canRefetch && <ResyncButton />}
        <div className="flex items-center">
          <GithubPrivateScopeLogin />
          <OptionButton
            active={active ? optionButtonOptions[0] : optionButtonOptions[1]}
            onChange={(option) =>
              setActive(option.text === optionButtonOptions[0].text)
            }
            options={optionButtonOptions}
          />
        </div>
      </span>
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
