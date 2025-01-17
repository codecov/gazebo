import { useInfiniteQuery as useInfiniteQueryV5 } from '@tanstack/react-queryV5'
import PropTypes from 'prop-types'
import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ReposQueryOpts } from 'services/repos/ReposQueryOpts'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import A from 'ui/A'
import DateRangePicker from 'ui/DateRangePicker'
import MultiSelect from 'ui/MultiSelect'

function formatDataForMultiselect(repos) {
  return repos?.map((repo) => repo.name)
}

function DateSelector({ startDate, endDate, updateParams }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">Dates</span>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={(args) => {
          const startDate = args?.from ?? null
          const endDate = args?.to ?? null

          updateParams({ startDate, endDate })
        }}
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
  const { owner, provider } = useParams()
  const [search, setSearch] = useState()

  const onSelectChangeHandler = (item) => {
    setSelectedRepos(item)
    updateParams({ repositories: item })
  }

  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })

  const {
    data: reposData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQueryV5(
    ReposQueryOpts({
      provider,
      owner,
      sortItem,
      activated: active,
      term: search,
      first: Infinity,
      isPublic: isTeamPlan,
    })
  )

  const reposSelectData = useMemo(() => {
    const data = reposData?.pages?.map((page) => page?.repos).flat()
    return data ?? []
  }, [reposData?.pages])

  return (
    <div className="flex w-52 flex-col gap-2">
      <span className="font-semibold">Repositories</span>
      <MultiSelect
        hook="repo-chart-selector"
        ariaName="Select repos to choose"
        dataMarketing="repo-chart-selector"
        items={formatDataForMultiselect(reposSelectData)}
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
  updateParams: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  sortItem: PropTypes.object.isRequired,
  selectedRepos: PropTypes.array.isRequired,
  setSelectedRepos: PropTypes.func.isRequired,
  resetRef: PropTypes.object.isRequired,
}

function ChartSelectors({ params, updateParams, active, sortItem }) {
  const { provider, owner } = useParams()
  const resetRef = useRef(null)
  const { repositories, startDate, endDate } = params
  const [selectedRepos, setSelectedRepos] = useState(repositories)

  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })

  if (selectedRepos.length > 0 && repositories.length === 0) {
    setSelectedRepos([])
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
    <div className="flex flex-wrap justify-center gap-4 border-b border-ds-gray-tertiary pb-4 sm:flex-nowrap sm:justify-start">
      <DateSelector
        startDate={startDate}
        endDate={endDate}
        updateParams={updateParams}
      />
      <RepoSelector
        active={active}
        updateParams={updateParams}
        sortItem={sortItem}
        selectedRepos={selectedRepos}
        setSelectedRepos={setSelectedRepos}
        resetRef={resetRef}
      />
      <button
        className="self-end text-ds-blue-darker md:mr-auto"
        onClick={clearFiltersHandler}
      >
        Clear filters
      </button>
      {isTeamPlan ? (
        <p className="self-end">
          Public repos only. <A to={{ pageName: 'upgradeOrgPlan' }}>Upgrade</A>{' '}
          to Pro to include private repos.
        </p>
      ) : null}
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
