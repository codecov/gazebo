import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export function useBranchSelector(branches, defaultBranch) {
  const { branch, ref } = useParams()
  // Decoding the value when it is undefined returns "undefined" as a string, which breaks the selector
  const decodedBranch = !!branch ? decodeURIComponent(branch) : branch
  const decodedRef = !!ref ? decodeURIComponent(ref) : ref
  const selection = useMemo(() => {
    const selectedBranch = decodedBranch || decodedRef || defaultBranch
    const [currentBranch] = branches?.filter((b) => b?.name === selectedBranch)
    return currentBranch
  }, [branches, decodedBranch, decodedRef, defaultBranch])

  return {
    selection,
    branchSelectorProps: {
      items: branches,
      value: selection,
    },
  }
}
