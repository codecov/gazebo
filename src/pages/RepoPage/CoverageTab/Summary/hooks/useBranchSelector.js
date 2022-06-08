import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'

import { useCoverageRedirect } from './useCoverageRedirect'

export function useBranchSelector(branches, defaultBranch) {
  const [items, setItems] = useState([])
  const [selection, setSelection] = useState()
  const { branch, ref } = useParams()
  const { setNewPath, newPath, enableRedirection } = useCoverageRedirect()

  const onChangeHandler = (slection) => {
    setNewPath(slection)
  }

  // Store cleaned up branches in state (else infinate rerenders)
  useEffect(() => {
    setItems(mapEdges(branches))
  }, [branches, setItems])

  // Set the current selected branch based on the branch/ref param or use the default branch
  useEffect(() => {
    const selectedBranch = branch || ref || defaultBranch
    const [currentBranch] = items.filter((b) => b.name === selectedBranch)
    setSelection(currentBranch || items[0]) // Found or fallback to the first result
  }, [branch, defaultBranch, items, ref, setSelection])

  return {
    selection,
    newPath,
    enableRedirection,
    branchSelectorProps: {
      items,
      value: selection,
      onChange: onChangeHandler,
    },
  }
}
