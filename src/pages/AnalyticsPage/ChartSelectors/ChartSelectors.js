import PropTypes from 'prop-types'
import { useState } from 'react'

import { useRepos } from 'services/repos/hooks'
import DateRangePicker from 'ui/DateRangePicker'
import MultiSelect from 'ui/MultiSelect'

function formatDataForMultiselect(repos) {
  return repos.map((repo) => repo.name)
}

function ChartSelectors({ params, updateParams, owner, active, sortItem }) {
  const { search, repositories } = params
  const [selectedRepos, setSelectedRepos] = useState(repositories)
  const { data } = useRepos({
    active,
    sortItem,
    term: search,
    owner,
    first: Infinity,
  })
  const customClasses = { button: 'py-1' }

  const items = formatDataForMultiselect(data?.repos)

  const onChangeHandler = (item) => {
    setSelectedRepos(item)
    updateParams({ repositories: item })
  }

  const handleClearFilters = () => {
    updateParams({
      startDate: null,
      endDate: null,
      repositories: [],
    })
    setSelectedRepos([])
  }

  return (
    <div className="flex gap-4 flex-wrap justify-center sm:flex-nowrap sm:justify-start">
      <div className="flex flex-col gap-3">
        <span className="font-semibold">Dates</span>
        <DateRangePicker
          startDate={params.startDate}
          endDate={params.endDate}
          updateParams={(startDate, endDate) =>
            updateParams({ startDate, endDate })
          }
        />
      </div>
      <div className="flex flex-col w-52 gap-3">
        <span className="font-semibold">Repositories</span>
        <MultiSelect
          ariaName="Select repos to choose"
          items={items}
          onChange={onChangeHandler}
          resourceName="Repo"
          selectedItems={selectedRepos}
          customClasses={customClasses}
        />
      </div>
      <button className="text-ds-blue-darker mt-7" onClick={handleClearFilters}>
        Clear filters
      </button>
    </div>
  )
}

ChartSelectors.propTypes = {
  params: PropTypes.object.isRequired,
  updateParams: PropTypes.func.isRequired,
  owner: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  sortItem: PropTypes.object.isRequired,
}

export default ChartSelectors
