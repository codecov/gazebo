import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { Branch, useBranch, useBranches } from 'services/branches'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

const getDecodedBranch = (branch?: string) =>
  !!branch ? decodeURIComponent(branch) : undefined

const BranchSelector = () => {
  const history = useHistory()
  const { failedTests: failedTestsLink } = useNavLinks()
  const { provider, owner, repo, branch } = useParams<URLParams>()
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>()

  const { data: overview } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const {
    data: branchList,
    isFetching: branchListIsFetching,
    hasNextPage: branchListHasNextPage,
    fetchNextPage: branchListFetchNextPage,
  } = useBranches({
    repo,
    owner,
    provider,
    filters: { searchValue: branchSearchTerm },
    opts: {
      suspense: false,
    },
  })

  const decodedBranch = getDecodedBranch(branch)
  const selectedBranch = decodedBranch ?? overview?.defaultBranch ?? ''

  const { data: searchBranchValue } = useBranch({
    provider,
    owner,
    repo,
    branch: selectedBranch,
    opts: {
      queryKey: ['GetSelectedBranch', provider, owner, repo, selectedBranch],
      enabled: !!selectedBranch,
    },
  })

  let selection = searchBranchValue?.branch
  if (!selection) {
    selection = {
      name: 'Select branch',
      head: null,
    }
  }

  if (
    selectedBranch === overview?.defaultBranch &&
    !branch &&
    selection.head !== null
  ) {
    history.push(
      failedTestsLink.path({ branch: encodeURIComponent(selection?.name) })
    )
  }

  return (
    <div className="flex flex-col gap-1 pr-4 sm:w-52 lg:w-64 xl:w-80">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        <span className="text-ds-gray-quinary">
          <Icon name="branch" size="sm" variant="developer" />
        </span>
        Branch Context
      </h3>
      <span className="text-sm">
        <Select
          // @ts-expect-error - Select has some TS issues because it's still written in JS
          dataMarketing="branch-selector-test-results-tab"
          ariaName="test results branch selector"
          items={branchList?.branches ?? []}
          value={selection}
          onChange={(item: Branch) => {
            history.push(
              failedTestsLink.path({ branch: encodeURIComponent(item?.name) })
            )
          }}
          variant="gray"
          renderItem={(item: Branch) => <span>{item?.name}</span>}
          isLoading={branchListIsFetching}
          onLoadMore={() => {
            if (branchListHasNextPage) {
              branchListFetchNextPage()
            }
          }}
          onSearch={(term: string) => setBranchSearchTerm(term)}
        />
      </span>
    </div>
  )
}

export default BranchSelector
