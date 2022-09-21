import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'

export function useBranchSelector(branches, defaultBranch) {
  const items = useMemo(() => mapEdges(branches), [branches])
  const { branch, ref } = useParams()
  // Decoding the value when it is undefined returns "undefined" as a string, which breaks the selector
  const decodedBranch = !!branch ? decodeURIComponent(branch) : branch
  const decodedRef = !!ref ? decodeURIComponent(ref) : ref
  const selection = useMemo(() => {
    const selectedBranch = decodedBranch || decodedRef || defaultBranch
    const [currentBranch] = items.filter((b) => b?.name === selectedBranch)
    return currentBranch
  }, [items, decodedBranch, decodedRef, defaultBranch])

  return {
    selection,
    branchSelectorProps: {
      items,
      value: selection,
    },
  }
}
