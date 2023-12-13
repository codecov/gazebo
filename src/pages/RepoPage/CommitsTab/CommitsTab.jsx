import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useParams } from 'react-router-dom'

import { useBranchHasCommits } from 'services/branches'
import { useLocationParams } from 'services/navigation'
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

const useControlParams = ({ defaultBranch }) => {
  const initialRenderDone = useRef(false)
  const { provider, owner, repo } = useParams()
  const defaultParams = {
    branch: defaultBranch,
    states: [],
    search: '',
  }

  const { params, updateParams } = useLocationParams(defaultParams)
  let { branch: selectedBranch, states, search } = params

  const paramStatesNames = states.map((filter) => statusNames[filter])

  const [selectedStates, setSelectedStates] = useState(paramStatesNames)

  const { data: branchHasCommits } = useBranchHasCommits({
    provider,
    owner,
    repo,
    branch: selectedBranch,
    opts: {
      suspense: true,
      enabled: !initialRenderDone.current,
    },
  })

  useEffect(() => {
    if (
      branchHasCommits === false &&
      selectedBranch !== ALL_BRANCHES &&
      !initialRenderDone.current
    ) {
      initialRenderDone.current = true
      updateParams({ branch: ALL_BRANCHES })
    }
  }, [branchHasCommits, selectedBranch, updateParams])

  let branch = selectedBranch
  if (branch === ALL_BRANCHES) {
    branch = ''
  }

  return {
    params,
    branch,
    selectedBranch,
    updateParams,
    selectedStates,
    setSelectedStates,
    search,
  }
}

function CommitsTab() {
  const setCrumbs = useSetCrumbs()
  const { provider, owner, repo } = useParams()

  const { data: repoSettings } = useRepoSettingsTeam()
  const { data: tierData } = useTier({ provider, owner })

  const showTeamTable =
    repoSettings?.repository?.private && tierData === TierNames.TEAM

  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const {
    branch,
    selectedBranch,
    updateParams,
    selectedStates,
    setSelectedStates,
    search,
  } = useControlParams({ defaultBranch: overview?.defaultBranch })

  const {
    branchList,
    branchSelectorProps,
    currentBranchSelected,
    branchesFetchNextPage,
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchSearchTerm,
    isSearching,
  } = useCommitsTabBranchSelector({
    passedBranch: branch,
    defaultBranch: overview?.defaultBranch,
    isAllCommits: selectedBranch === ALL_BRANCHES,
  })

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
                  updateParams({ branch: branch })
                }}
                onLoadMore={() => {
                  if (branchListHasNextPage) {
                    branchesFetchNextPage()
                    branchListFetchNextPage()
                  }
                }}
                onSearch={(term) => setBranchSearchTerm(term)}
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
            branch={branch}
            states={selectedStates?.map((state) => state?.toUpperCase())}
            search={search}
          />
        ) : (
          <CommitsTable
            branch={branch}
            states={selectedStates?.map((state) => state?.toUpperCase())}
            search={search}
          />
        )}
      </Suspense>
    </div>
  )
}

export default CommitsTab
