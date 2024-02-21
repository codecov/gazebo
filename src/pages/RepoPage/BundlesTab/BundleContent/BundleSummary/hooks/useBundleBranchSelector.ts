import { useParams } from 'react-router-dom'

import { Branch, useBranch } from 'services/branches'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  ref?: string
}

const getDecodedBranch = (branch?: string) =>
  !!branch ? decodeURIComponent(branch) : undefined

const getDecodedRef = (ref?: string) =>
  !!ref ? decodeURIComponent(ref) : undefined

interface UseBundleBranchSelectorProps {
  branches: Branch[] | null
  defaultBranch: string
}

export function useBundleBranchSelector({
  branches,
  defaultBranch,
}: UseBundleBranchSelectorProps) {
  const { provider, owner, repo, branch, ref } = useParams<URLParams>()
  // Decoding the value when it is undefined returns "undefined" as a string, which breaks the selector
  const decodedBranch = getDecodedBranch(branch)
  const decodedRef = getDecodedRef(ref)
  const selectedBranch = decodedBranch ?? decodedRef ?? defaultBranch

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
