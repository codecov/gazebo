import { useParams } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'

import { useBranchSelector } from './useBranchSelector'

export function useSummary() {
  const { repo, owner, provider } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { selection, branchSelectorProps } = useBranchSelector(
    overview?.branches,
    overview?.defaultBranch
  )
  const { data, isLoading: isLoadingRepoCoverage } = useRepoCoverage({
    provider,
    repo,
    owner,
    branch: selection?.name,
    options: { enabled: !!selection?.name },
  })

  return {
    isLoading: isLoading && isLoadingRepoCoverage,
    data,
    branchSelectorProps,
    currentBranchSelected: selection,
    defaultBranch: overview?.defaultBranch,
    privateRepo: overview?.private,
  }
}
