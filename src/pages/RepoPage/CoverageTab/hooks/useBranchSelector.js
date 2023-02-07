import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'

const getDecodedBranch = (branch) =>
  !!branch ? decodeURIComponent(branch) : branch

const getDecodedRef = (ref) => (!!ref ? decodeURIComponent(ref) : ref)

export function useBranchSelector({ branches, defaultBranch }) {
  const { provider, owner, repo, branch, ref } = useParams()
  // Decoding the value when it is undefined returns "undefined" as a string, which breaks the selector
  const decodedBranch = getDecodedBranch(branch)
  const decodedRef = getDecodedRef(ref)
  const selectedBranch = decodedBranch || decodedRef || defaultBranch

  const { data: searchBranchValue } = useBranches({
    provider,
    owner,
    repo,
    filters: { searchValue: selectedBranch },
    opts: {
      queryKey: ['GetSelectedBranch', provider, owner, repo],
    },
  })

  const [selection] = searchBranchValue?.branches

  return {
    selection,
    branchSelectorProps: {
      items: branches,
      value: selection,
    },
  }
}
