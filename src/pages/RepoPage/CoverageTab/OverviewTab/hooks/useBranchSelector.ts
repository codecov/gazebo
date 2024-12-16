import { useParams } from 'react-router-dom'

import { Branch, useBranch } from 'services/branches'

const getDecodedBranch = (branch?: string) =>
  branch ? decodeURIComponent(branch) : branch

const getDecodedRef = (ref?: string) => (ref ? decodeURIComponent(ref) : ref)

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
  ref: string
}

interface UseBranchSelectorArgs {
  branches: Branch[]
  defaultBranch: string
}

export function useBranchSelector({
  branches,
  defaultBranch,
}: UseBranchSelectorArgs) {
  const { provider, owner, repo, branch, ref } = useParams<URLParams>()
  // Decoding the value when it is undefined returns "undefined" as a string, which breaks the selector
  const decodedBranch = getDecodedBranch(branch)
  const decodedRef = getDecodedRef(ref)
  const selectedBranch = decodedBranch || decodedRef || defaultBranch

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

  return {
    selection,
    branchSelectorProps: {
      items: branches,
      value: selection,
    },
  }
}
