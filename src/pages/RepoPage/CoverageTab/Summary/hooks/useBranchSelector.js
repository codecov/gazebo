import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'

export function useBranchSelector(branches, defaultBranch) {
  const items = useMemo(() => mapEdges(branches), [branches])
  const { branch, ref } = useParams()
  const selection = useMemo(() => {
    const selectedBranch = branch || ref || defaultBranch
    const [currentBranch] = items.filter((b) => b.name === selectedBranch)
    return currentBranch
  }, [items, branch, ref, defaultBranch])

  return {
    selection,
    branchSelectorProps: {
      items,
      value: selection,
    },
  }
}
