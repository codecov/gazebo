import { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useBranch } from 'services/branches/useBranch'
import { Branch, useBranches } from 'services/branches/useBranches'
import { useNavLinks } from 'services/navigation/useNavLinks'
import { useRepoOverview } from 'services/repo'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

export const ALL_BRANCHES = 'All Branches'

const getDecodedBranch = (branch?: string) =>
  branch ? decodeURIComponent(branch) : undefined

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

  const decodedBranch = getDecodedBranch(branch) ?? ''

  const { data: searchBranchValue } = useBranch({
    provider,
    owner,
    repo,
    branch: decodedBranch,
    opts: {
      queryKey: ['GetSelectedBranch', provider, owner, repo, decodedBranch],
      enabled: !!decodedBranch,
    },
  })

  let selection = searchBranchValue?.branch
  if (!selection) {
    selection = {
      name: ALL_BRANCHES,
      head: null,
    }
  }

  const sortedBranchList = useMemo(() => {
    if (!branchList?.branches) return []

    if (overview?.defaultBranch) {
      return [
        // Pins the default branch to the top of the list always, filters it from results otherwise
        { name: ALL_BRANCHES, head: null },
        { name: overview.defaultBranch, head: null },
        ...branchList.branches.filter(
          (branch) => branch.name !== overview.defaultBranch
        ),
      ]
    }
    return branchList.branches
  }, [overview?.defaultBranch, branchList.branches])

  return (
    <div className="flex w-full flex-col gap-1 px-4 lg:w-64 xl:w-80">
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
          items={sortedBranchList}
          value={selection}
          onChange={(item: Branch) => {
            history.push(
              failedTestsLink.path({
                branch:
                  item?.name === ALL_BRANCHES
                    ? ''
                    : encodeURIComponent(item?.name),
              })
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
