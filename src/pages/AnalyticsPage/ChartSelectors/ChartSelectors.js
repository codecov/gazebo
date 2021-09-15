import PropTypes from 'prop-types'
import { useRepos } from 'services/repos/hooks'
import MultiSelect from 'ui/MultiSelect'
import { useState } from 'react'
import Datepicker from 'ui/Datepicker'

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

  // TODO: Ensure this brings all data and bypasses pagination
  const items = formatDataForMultiselect(data?.repos)

  const onChangeHandler = (item) => {
    setSelectedRepos(item)
    updateParams({ repositories: item })
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <span className="font-semibold">Dates</span>
        <Datepicker params={params} updateParams={updateParams} />
      </div>
      <div className="flex flex-col w-52 gap-3">
        <span className="font-semibold">Repositories</span>
        <MultiSelect
          ariaName="Select repos to choose"
          items={items}
          onChange={onChangeHandler}
          resourceName="Repo"
          selectedItems={selectedRepos}
        />
      </div>
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
