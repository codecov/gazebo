import { useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import Checkbox from 'ui/Checkbox'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

import CommitsTable from './CommitsTable'
import { useCommitsTabBranchSelector } from './hooks'

import { useSetCrumbs } from '../context'

const useParamsFilters = (defaultBranch) => {
  const defaultParams = {
    branch: defaultBranch,
    hideFailedCI: false,
  }
  const { params, updateParams } = useLocationParams(defaultParams)
  const { branch: selectedBranch, hideFailedCI } = params

  const paramCIStatus = hideFailedCI === true || hideFailedCI === 'true'

  let branch = selectedBranch
  if (branch === 'All commits') {
    branch = ''
  }

  return { branch, selectedBranch, paramCIStatus, updateParams }
}

function CommitsTab() {
  const setCrumbs = useSetCrumbs()
  const { repo, owner, provider } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const { branch, selectedBranch, paramCIStatus, updateParams } =
    useParamsFilters(overview?.defaultBranch)

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
    isAllCommits: selectedBranch === 'All commits',
  })

  const newBranches = [...(isSearching ? [] : ['All commits']), ...branchList]

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="inline-flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {currentBranchSelected?.name}
          </span>
        ),
      },
    ])
  }, [currentBranchSelected?.name, setCrumbs])

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex justify-between gap-2 px-2 sm:px-0">
        <div className="flex flex-col gap-1">
          <h2 className="flex flex-initial items-center gap-1 font-semibold">
            <span className="text-ds-gray-quinary">
              <Icon name="branch" variant="developer" size="sm" />
            </span>
            Branch Context
          </h2>
          <div className="min-w-[16rem]">
            <Select
              {...branchSelectorProps}
              dataMarketing="branch-selector-commits-page"
              ariaName="Select branch"
              variant="gray"
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
        <Checkbox
          dataMarketing="hide-commits-with-failed-CI"
          label="Hide commits with failed CI"
          name="filter commits"
          onChange={(e) => {
            updateParams({ hideFailedCI: e.target.checked })
          }}
          checked={paramCIStatus}
        />
      </div>
      <CommitsTable branch={branch} paramCIStatus={paramCIStatus} />
    </div>
  )
}

export default CommitsTab
