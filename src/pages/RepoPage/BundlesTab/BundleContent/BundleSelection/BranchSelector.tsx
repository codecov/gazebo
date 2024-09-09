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
  resetBundleSelect: () => void
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  resetBundleSelect,
}) => {
  const history = useHistory()
  const { bundles: bundlesLink } = useNavLinks()
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

  // if the selected branch is the default branch and no branch is selected
  // redirect to the default branch
  if (
    selectedBranch === overview?.defaultBranch &&
    !branch &&
    selection.head !== null
  ) {
    history.push(
      bundlesLink.path({ branch: encodeURIComponent(selection?.name) })
    )
  }

  return (
    <div className="md:w-64">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        <span className="text-ds-gray-quinary">
          <Icon name="branch" size="sm" variant="developer" />
        </span>
        Branch Context
      </h3>
      <span className="min-w-64 text-sm">
        <Select
          // @ts-expect-error - Select has some TS issues because it's still written in JS
          dataMarketing="branch-selector-bundle-tab"
          ariaName="bundle branch selector"
          items={branchList?.branches ?? []}
          value={selection}
          onChange={(item: Branch) => {
            resetBundleSelect()
            history.push(
              bundlesLink.path({ branch: encodeURIComponent(item?.name) })
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
        {selection?.head?.commitid && (
          <p className="pt-2 text-xs">
            <span className="font-bold">Source:</span> latest commit{' '}
            <A
              isExternal={false}
              hook="repo-page-bundle-summary-commit-link"
              to={{
                pageName: 'commit',
                options: { commit: selection?.head?.commitid },
              }}
            >
              {selection?.head?.commitid.slice(0, 7)}
            </A>
          </p>
        )}
      </span>
    </div>
  )
}

export default BranchSelector
