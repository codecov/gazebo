import { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useBranch } from 'services/branches/useBranch'
import { Branch, useBranches } from 'services/branches/useBranches'
import { ALL_BRANCHES, useNavLinks } from 'services/navigation/useNavLinks'
import { useRepoOverview } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

const getDecodedBranch = (branch?: string) =>
  branch ? decodeURIComponent(branch) : undefined

const BranchSelector = () => {
  const { allBranchesEnabled: allBranchesEnabledFlag } = useFlags({
    allBranchesEnabled: false,
  })

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
  const selectedBranch = allBranchesEnabledFlag
    ? (decodedBranch ?? ALL_BRANCHES)
    : (decodedBranch ?? overview?.defaultBranch ?? '')

  console.log('selectedBranch', selectedBranch)

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
  console.log('selection', selection)

  if (!allBranchesEnabledFlag) {
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
  } else {
    if (!selection) {
      if (branch) {
        selection = {
          name: branch,
          head: null,
        }
      } else {
        selection = {
          name: 'Select branch',
          head: null,
        }
      }
    }

    if (!branch) {
      history.push(
        failedTestsLink.path({ branch: encodeURIComponent(ALL_BRANCHES) })
      )
    }
  }

  const sortedBranchList = useMemo(() => {
    if (!branchList?.branches?.length) return []

    if (!allBranchesEnabledFlag) {
      if (overview?.defaultBranch) {
        return [
          // Pins the default branch to the top of the list always, filters it from results otherwise
          { name: overview.defaultBranch, head: null },
          ...branchList.branches.filter(
            (branch) => branch.name !== overview.defaultBranch
          ),
        ]
      }
      return branchList.branches
    } else {
      if (overview?.defaultBranch) {
        return [
          // Pins the default branch to the top of the list always, filters it from results otherwise
          { name: ALL_BRANCHES, head: null },
          { name: overview.defaultBranch, head: null },
          ...branchList.branches.filter(
            (branch) =>
              branch.name !== overview.defaultBranch &&
              branch.name !== ALL_BRANCHES
          ),
        ]
      }
    }
  }, [overview?.defaultBranch, branchList.branches, allBranchesEnabledFlag])

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
