import { useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'

import CommitsTable from './CommitsTable'
import { filterItems, statusEnum, statusNames } from './enums'
import { useCommitsTabBranchSelector } from './hooks'

import { useSetCrumbs } from '../context'

const useControlParams = ({ defaultBranch }) => {
  const defaultParams = {
    branch: defaultBranch,
    states: [],
    search: '',
  }

  const { params, updateParams } = useLocationParams(defaultParams)
  const { branch: selectedBranch, states, search } = params

  const paramStatesNames = states.map((filter) => statusNames[filter])

  const [selectedStates, setSelectedStates] = useState(paramStatesNames)

  let branch = selectedBranch
  if (branch === 'All branches') {
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
  const { repo, owner, provider } = useParams()
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
    isAllCommits: selectedBranch === 'All branches',
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

  const newBranches = [...(isSearching ? [] : ['All branches']), ...branchList]

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
      <CommitsTable
        branch={branch}
        states={selectedStates?.map((state) => state?.toUpperCase())}
        search={search}
      />
    </div>
  )
}

export default CommitsTab
