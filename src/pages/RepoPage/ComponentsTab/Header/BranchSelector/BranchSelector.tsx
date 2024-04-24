import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Branch, useBranch, useBranches } from 'services/branches'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
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

const BranchSelector: React.FC = () => {
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

  return (
    <div className="md:w-[16rem]">
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
        />
      </span>
    </div>
  )
}

export default BranchSelector
