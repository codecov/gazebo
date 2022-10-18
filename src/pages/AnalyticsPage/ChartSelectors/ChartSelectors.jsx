import PropTypes from 'prop-types'
import { useRef, useState } from 'react'

import { useRepos } from 'services/repos'
import DateRangePicker from 'ui/DateRangePicker'
import MultiSelect from 'ui/NewMultiSelect'

function formatDataForMultiselect(repos) {
  return repos?.map((repo) => repo.name)
}

function ChartSelectors({ params, updateParams, owner, active, sortItem }) {
  const { repositories, startDate, endDate } = params
  const [selectedRepos, setSelectedRepos] = useState(repositories)
  const [search, setSearch] = useState()
  const { data, isLoading, fetchNextPage, hasNextPage } = useRepos({
    active,
    sortItem,
    term: search,
    owner,
    first: Infinity,
    suspense: false,
  })
  const resetRef = useRef(null)

  const items = formatDataForMultiselect(data?.repos)

  const onSelectChangeHandler = (item) => {
    setSelectedRepos(item)
    updateParams({ repositories: item })
  }

  const onDateRangeChangeHandler = ([startDate, endDate]) => {
    updateParams({ startDate, endDate })
  }

  const clearFiltersHandler = () => {
    updateParams({
      startDate: null,
      endDate: null,
      repositories: [],
    })
    resetRef?.current?.resetSelected()
    setSelectedRepos([])
  }

  return (
    <div className="flex gap-4 flex-wrap justify-center sm:flex-nowrap sm:justify-start">
      <div className="flex flex-col gap-3">
        <span className="font-semibold">Dates</span>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={onDateRangeChangeHandler}
        />
      </div>
      <div className="flex flex-col w-52 gap-3">
        <span className="font-semibold">Repositories</span>
        <MultiSelect
          hook="repo-chart-selector"
          ariaName="Select repos to choose"
          items={items}
          onChange={onSelectChangeHandler}
          resourceName="Repo"
          selectedItems={selectedRepos}
          isLoading={isLoading}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          onSearch={(search) => setSearch(search)}
          ref={resetRef}
        />
      </div>
      <button
        className="text-ds-blue-darker mt-7"
        onClick={clearFiltersHandler}
      >
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
