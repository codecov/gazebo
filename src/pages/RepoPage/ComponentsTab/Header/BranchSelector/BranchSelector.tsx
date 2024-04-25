import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Branch, useBranch, useBranches } from 'services/branches'
import { useLocationParams } from 'services/navigation'
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

const defaultQueryParams = {
  branch: '',
}

const getDecodedBranch = (branch?: string) =>
  !!branch ? decodeURIComponent(branch) : undefined

interface BranchSelectorProps {
  isDisabled: boolean | undefined
}

const BranchSelector: React.FC<BranchSelectorProps> = ({ isDisabled }) => {
  const { provider, owner, repo, branch } = useParams<URLParams>()
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>('')

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

  const selectedBranch =
    // @ts-expect-error
    decodedBranch || params.branch || overview?.defaultBranch || ''

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
    <div className="flex flex-col justify-between gap-2 p-4 sm:py-0 md:w-[16rem]">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        <span className="text-ds-gray-quinary">
          <Icon name="branch" size="sm" variant="developer" />
        </span>
        Branch Context
      </h3>
      <span className="min-w-[16rem] text-sm">
        <Select
          // @ts-expect-error - select is not typed
          dataMarketing="branch-selector-components-tab"
          ariaName="components branch selector"
          items={branchList?.branches ?? []}
          // @ts-expect-error - params is not typed
          value={params?.branch ? { name: params.branch } : selection}
          onChange={(item: Branch) => {
            updateParams({ branch: item.name })
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
