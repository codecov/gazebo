import PropTypes from 'prop-types'
import { useRef, useState } from 'react'

import { useRepos } from 'services/repos'
import DateRangePicker from 'ui/DateRangePicker'
import MultiSelect from 'ui/MultiSelect'

function formatDataForMultiselect(repos) {
  return repos?.map((repo) => repo.name)
}

// eslint-disable-next-line max-statements
function ChartSelectors({ params, updateParams, owner, active, sortItem }) {
  const resetRef = useRef(null)
  const { repositories, startDate, endDate } = params

  const [selectedRepos, setSelectedRepos] = useState(repositories)

  if (selectedRepos.length > 0 && repositories.length === 0) {
    setSelectedRepos([])
  }

  const [search, setSearch] = useState()
  const { data, isLoading, fetchNextPage, hasNextPage } = useRepos({
    active,
    sortItem,
    term: search,
    owner,
    first: Infinity,
    suspense: false,
  })

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
    <div className="flex flex-wrap justify-center gap-4 sm:flex-nowrap sm:justify-start">
      <div className="flex flex-col gap-3">
        <span className="font-semibold">Dates</span>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={onDateRangeChangeHandler}
        />
      </div>
      <div className="flex w-52 flex-col gap-3">
        <span className="font-semibold">Repositories</span>
        <MultiSelect
          hook="repo-chart-selector"
          ariaName="Select repos to choose"
          dataMarketing="repo-chart-selector"
          items={formatDataForMultiselect(data?.repos)}
          onChange={onSelectChangeHandler}
          resourceName="Repo"
          value={selectedRepos}
          isLoading={isLoading}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          onSearch={(search) => setSearch(search)}
          ref={resetRef}
          selectedItemsOverride={selectedRepos}
        />
      </div>
      <button
        className="mt-7 text-ds-blue-darker"
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
