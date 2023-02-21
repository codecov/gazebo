import { useLayoutEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import Checkbox from 'ui/Checkbox'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

import CommitsTable from './CommitsTable'

import { useSetCrumbs } from '../context'

const useParamsFilters = (defaultBranch) => {
  const defaultParams = {
    branch: defaultBranch,
    hideFailedCI: false,
  }
  const { params, updateParams } = useLocationParams(defaultParams)
  const { branch, hideFailedCI } = params

  const paramCIStatus = hideFailedCI === true || hideFailedCI === 'true'

  return { branch, paramCIStatus, updateParams }
}

function CommitsTab() {
  const [branchSearchTerm, setBranchSearchTerm] = useState()
  const setCrumbs = useSetCrumbs()
  const { provider, owner, repo } = useParams()

  const {
    data: branchesData,
    isFetching: branchesIsFetching,
    fetchNextPage: branchesFetchNextPage,
    hasNextPage: branchesHasNextPage,
  } = useBranches({
    provider,
    owner,
    repo,
    filters: { searchValue: branchSearchTerm },
    opts: {
      suspense: false,
    },
  })

  const { data: repoData } = useRepo({ provider, owner, repo })
  const branchesNames =
    branchesData?.branches?.map((branch) => branch?.name) || []

  const { branch, paramCIStatus, updateParams } = useParamsFilters(
    repoData?.repository?.defaultBranch
  )

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {branch}
          </span>
        ),
      },
    ])
  }, [branch, setCrumbs])

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
              dataMarketing="branch-selector-commits-page"
              ariaName="Select branch"
              variant="gray"
              items={branchesNames}
              isLoading={branchesIsFetching}
              onChange={(branch) => {
                updateParams({ branch })
              }}
              onLoadMore={() => {
                branchesHasNextPage && branchesFetchNextPage()
              }}
              value={branch}
              onSearch={(term) => setBranchSearchTerm(term)}
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
