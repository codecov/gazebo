import PropTypes from 'prop-types'
import { useRef } from 'react'

import { useRepos } from 'services/repos/hooks'
import DateRangePicker from 'ui/DateRangePicker'
import MultipleSelect from 'ui/MultipleSelect'

function formatDataForMultiselect(repos) {
  return repos.map((repo) => repo.name)
}

function ChartSelectors({ params, updateParams, owner, active, sortItem }) {
  const { search, repositories, startDate, endDate } = params
  const { data } = useRepos({
    active,
    sortItem,
    term: search,
    owner,
    first: Infinity,
  })

  const multiSelectRef = useRef(null)
  const items = formatDataForMultiselect(data?.repos)

  const onDateRangeChangeHandler = ([startDate, endDate]) => {
    updateParams({ startDate, endDate })
  }

  const clearFiltersHandler = () => {
    updateParams({
      startDate: null,
      endDate: null,
      repositories: [],
    })
    multiSelectRef?.current?.resetSelected()
  }

  return (
    <div className="flex gap-4 flex-wrap justify-center sm:flex-nowrap sm:justify-start">
      <div className="flex flex-col w-60 gap-3">
        <span className="font-semibold">Dates</span>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={onDateRangeChangeHandler}
        />
      </div>
      <div className="flex flex-col w-52 gap-3">
        <span className="font-semibold">Repositories</span>
        <MultipleSelect
          ariaName="Select repos to choose"
          items={items}
          onChange={(repos) => {
            updateParams({ repositories: repos })
          }}
          resourceName="Repo"
          value={repositories}
          ref={multiSelectRef}
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
