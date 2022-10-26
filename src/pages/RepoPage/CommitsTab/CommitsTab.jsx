import { useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useCommits } from 'services/commits'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import Button from 'ui/Button'
import Checkbox from 'ui/Checkbox'
import Icon from 'ui/Icon'
import Select from 'ui/NewSelect'

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
  const setCrumbs = useSetCrumbs()
  const { provider, owner, repo } = useParams()

  const {
    data: branchesData,
    isFetching: branchesIsFetching,
    fetchNextPage: branchesFetchNextPage,
    hasNextPage: branchesHasNextPage,
  } = useBranches({ provider, owner, repo })
  const { data: repoData } = useRepo({ provider, owner, repo })
  const branchesNames =
    branchesData?.branches?.map((branch) => branch.name) || []

  const { branch, paramCIStatus, updateParams } = useParamsFilters(
    repoData?.repository?.defaultBranch
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      hideFailedCI: paramCIStatus,
      branchName: branch,
    },
  })

  const commits = data?.commits

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
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex gap-2 justify-between px-2 sm:px-0">
        <div className="flex gap-1 flex-col">
          <h2 className="font-semibold flex gap-1 flex-initial">
            <span>
              <Icon name="branch" variant="developer" size="sm" />
            </span>
            Branch Context
          </h2>
          <div>
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
      <CommitsTable commits={commits} />
      {hasNextPage && (
        <div className="flex-1 mt-4 flex justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default CommitsTab
