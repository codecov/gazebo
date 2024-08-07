import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranchHasCommits } from 'services/branches'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'
import Spinner from 'ui/Spinner'

import { filterItems, statusEnum } from './enums'
import { useCommitsTabBranchSelector } from './hooks'

const ALL_BRANCHES = 'All branches'
const CommitsTable = lazy(() => import('./CommitsTable'))

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
    coverageStatus: [],
    search: '',
  }

  const { params, updateParams } = useLocationParams(defaultParams)
  let { branch: selectedBranch, coverageStatus, search } = params

  const paramStatesNames = coverageStatus.map((filter) => statusEnum[filter])

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
  const { provider, owner, repo } = useParams()

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

  const newBranches = [...(isSearching ? [] : [ALL_BRANCHES]), ...branchList]

  const handleStatusChange = (selectStates) => {
    const commitStates = selectStates?.map(({ status }) => statusEnum[status])
    setSelectedStates(commitStates)
    updateParams({ coverageStatus: commitStates?.map((state) => state.status) })
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
            <div className="min-w-52 lg:min-w-64">
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
            <h2 className="font-semibold">Coverage upload status</h2>
            <div className="min-w-52 lg:min-w-64">
              <MultiSelect
                dataMarketing="commits-filter-by-coverage-status"
                ariaName="Filter by coverage upload status"
                value={selectedStates}
                items={filterItems}
                renderItem={(item) => item.option}
                resourceName="upload"
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
        <CommitsTable
          branch={branch}
          coverageStatus={selectedStates?.map((state) => state?.status)}
          search={search}
        />
      </Suspense>
    </div>
  )
}

export default CommitsTab
