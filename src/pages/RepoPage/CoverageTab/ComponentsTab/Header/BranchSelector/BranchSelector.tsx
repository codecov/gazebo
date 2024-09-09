import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { Branch, useBranch, useBranches } from 'services/branches'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
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

interface BranchSelectorProps {
  isDisabled: boolean | undefined
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  isDisabled = false,
}) => {
  const { provider, owner, repo, branch } = useParams<URLParams>()
  // this should be removed when we propogate selected branch between tabs
  const { data: overview } = useRepoOverview({
    provider,
    owner,
    repo,
  })
  const [selectedBranch, setSelectedBranch] = useState<string>(
    branch ?? overview?.defaultBranch ?? ''
  )
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>('')
  const history = useHistory()
  const { componentsTab } = useNavLinks()

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

  return (
    <div className="flex flex-col justify-between gap-2 p-4 sm:py-0 md:w-64">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        <span className="text-ds-gray-quinary">
          <Icon name="branch" size="sm" variant="developer" />
        </span>
        Branch Context
      </h3>
      <span className="min-w-64 text-sm">
        <Select
          // @ts-expect-error - select is not typed
          dataMarketing="branch-selector-components-tab"
          ariaName="components branch selector"
          items={branchList?.branches ?? []}
          value={decodedBranch ? { name: decodedBranch } : selection}
          onChange={(branch: Branch) => {
            setSelectedBranch(branch?.name)
            history.push(
              componentsTab.path({
                branch: encodeURIComponent(branch?.name),
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
          disabled={isDisabled}
        />
      </span>
      {selection?.head?.commitid && (
        <p className="text-xs">
          <span className="font-bold">Source:</span> latest commit{' '}
          <A
            to={{
              pageName: 'commit',
              options: { commit: selection?.head?.commitid },
            }}
            isExternal={false}
            hook="components-latest-commit"
          >
            {selection?.head?.commitid.slice(0, 7)}
          </A>
        </p>
      )}
    </div>
  )
}

export default BranchSelector
