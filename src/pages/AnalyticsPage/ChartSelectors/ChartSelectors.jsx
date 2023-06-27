import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepos } from 'services/repos'
import DateRange from 'ui/DateRangePicker'
import MultiSelect from 'ui/MultiSelect'

function formatDataForMultiselect(repos) {
  return repos?.map((repo) => repo.name)
}

function DateSelector({ startDate, endDate, updateParams }) {
  const onDateRangeChangeHandler = ([startDate, endDate]) => {
    updateParams({ startDate, endDate })
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="font-semibold">Dates</span>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={onDateRangeChangeHandler}
      />
    </div>
  )
}

DateSelector.propTypes = {
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  updateParams: PropTypes.func.isRequired,
}

function RepoSelector({
  active,
  updateParams,
  sortItem,
  selectedRepos,
  setSelectedRepos,
  resetRef,
}) {
  const { owner } = useParams()
  const [search, setSearch] = useState()

  const onSelectChangeHandler = (item) => {
    setSelectedRepos(item)
    updateParams({ repositories: item })
  }

  const { data, isLoading, fetchNextPage, hasNextPage } = useRepos({
    active,
    sortItem,
    term: search,
    owner,
    first: Infinity,
    suspense: false,
  })

  return (
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
  )
}

RepoSelector.propTypes = {
  params: PropTypes.object.isRequired,
  updateParams: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  sortItem: PropTypes.object.isRequired,
  selectedRepos: PropTypes.array.isRequired,
  setSelectedRepos: PropTypes.func.isRequired,
  resetRef: PropTypes.object.isRequired,
}

function ChartSelectors({ params, updateParams, active, sortItem }) {
  const resetRef = useRef(null)
  const { repositories, startDate, endDate } = params

  const [selectedRepos, setSelectedRepos] = useState(repositories)

  if (selectedRepos.length > 0 && repositories.length === 0) {
    setSelectedRepos([])
  }

  const onSelectChangeHandler = (item) => {
    setSelectedRepos(item)
    updateParams({ repositories: item })
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
        <DateRange
          startDate={startDate}
          endDate={endDate}
          onChange={(args) => {
            const startDate = args?.from ?? null
            const endDate = args?.to ?? null

            updateParams({ startDate, endDate })
          }}
        />
      </div>
      <div className="flex w-52 flex-col gap-3">
        <span className="font-semibold">Repositories</span>
        <RepoSelector
          active={active}
          updateParams={updateParams}
          sortItem={sortItem}
          selectedRepos={selectedRepos}
          setSelectedRepos={setSelectedRepos}
          resetRef={resetRef}
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
  active: PropTypes.bool.isRequired,
  sortItem: PropTypes.object.isRequired,
}

export default ChartSelectors
