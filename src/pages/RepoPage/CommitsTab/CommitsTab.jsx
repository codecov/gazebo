import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useLocationParams, useNavLinks } from 'services/navigation'
import { useRepoOverview, useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'
import Spinner from 'ui/Spinner'

import { filterItems, statusEnum, statusNames } from './enums'
import { useCommitsTabBranchSelector } from './hooks'

import { useSetCrumbs } from '../context'

const ALL_BRANCHES = 'All branches'
const CommitsTable = lazy(() => import('./CommitsTable'))
const CommitsTableTeam = lazy(() => import('./CommitsTableTeam'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

const useControlParams = () => {
  const defaultParams = {
    states: [],
    search: '',
  }

  const { params, updateParams } = useLocationParams(defaultParams)
  let { states, search } = params

  const paramStatesNames = states.map((filter) => statusNames[filter])
  const [selectedStates, setSelectedStates] = useState(paramStatesNames)

  return {
    params,
    updateParams,
    selectedStates,
    setSelectedStates,
    search,
  }
}

function CommitsTab() {
  const setCrumbs = useSetCrumbs()
  const history = useHistory()

  const { provider, owner, repo, branch: branchParam } = useParams()
  const { commits } = useNavLinks()

  const { data: repoSettings } = useRepoSettingsTeam()
  const { data: tierData } = useTier({ provider, owner })

  const showTeamTable =
    repoSettings?.repository?.private && tierData === TierNames.TEAM

  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const defaultBranch = overview?.defaultBranch

  const [selectedBranch, setSelectedBranch] = useState(
    branchParam ?? defaultBranch
  )

  const { updateParams, selectedStates, setSelectedStates, search } =
    useControlParams()

  const {
    branchList,
    branchSelectorProps,
    currentBranchSelected,
    branchesFetchNextPage,
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchTerm,
    isSearching,
  } = useCommitsTabBranchSelector({
    passedBranch: selectedBranch,
    defaultBranch: defaultBranch,
    isAllCommits: selectedBranch === ALL_BRANCHES,
  })

  useEffect(() => {
    if (
      !isLoading &&
      selectedBranch === defaultBranch &&
      branchParam !== defaultBranch
    ) {
      history.push(commits.path({ branch: encodeURIComponent(selectedBranch) }))
    }
  }, [defaultBranch, history, isLoading, selectedBranch, branchParam, commits])

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="inline-flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {currentBranchSelected}
          </span>
        ),
      },
    ])
  }, [currentBranchSelected, setCrumbs])

  const newBranches = [...(isSearching ? [] : [ALL_BRANCHES]), ...branchList]

  const handleStatusChange = (selectStates) => {
    const commitStates = selectStates?.map(
      (filter) => statusEnum[filter].status
    )
    setSelectedStates(commitStates)
    updateParams({ states: commitStates })
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 justify-between gap-4 md:grid-cols-2 md:items-end md:gap-0">
        <div className="flex flex-col gap-2 px-2 sm:px-0 md:flex-row">
          <div className="flex flex-col gap-1">
            <h2 className="flex flex-initial items-center gap-1 font-semibold">
              <span className="text-ds-gray-quinary">
                <Icon name="branch" variant="developer" size="sm" />
              </span>
              Branch Context
            </h2>
            <div className="min-w-[13rem] lg:min-w-[16rem]">
              <Select
                {...branchSelectorProps}
                dataMarketing="branch-selector-commits-page"
                ariaName="Select branch"
                variant="gray"
                resourceName="branch"
                isLoading={branchListIsFetching}
                onChange={(branch) => {
                  setSelectedBranch(branch)

                  if (branch === ALL_BRANCHES) {
                    return history.push(commits.path())
                  }

                  history.push(
                    commits.path({
                      branch: encodeURIComponent(branch),
                    })
                  )
                }}
                onLoadMore={() => {
                  if (branchListHasNextPage) {
                    branchesFetchNextPage()
                    branchListFetchNextPage()
                  }
                }}
                onSearch={(term) => setBranchTerm(term)}
                items={newBranches}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">CI status</h2>
            <div className="min-w-[13rem] lg:min-w-[16rem]">
              <MultiSelect
                dataMarketing="commits-filter-by-status"
                ariaName="Filter by CI states"
                value={selectedStates}
                items={filterItems}
                resourceName="CI States"
                onChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
        <div className="flex px-2 sm:px-0 md:flex-row-reverse">
          <SearchField
            dataMarketing="commits-tab-search"
            placeholder="Search commits"
            searchValue={search || ''}
            setSearchValue={(search) => updateParams({ search })}
            data-testid="search-input-members"
          />
        </div>
      </div>
      <Suspense fallback={<Loader />}>
        {showTeamTable ? (
          <CommitsTableTeam
            branch={selectedBranch}
            states={selectedStates?.map((state) => state?.toUpperCase())}
            search={search}
          />
        ) : (
          <CommitsTable
            branch={selectedBranch === ALL_BRANCHES ? '' : selectedBranch}
            states={selectedStates?.map((state) => state?.toUpperCase())}
            search={search}
          />
        )}
      </Suspense>
    </div>
  )
}

export default CommitsTab
