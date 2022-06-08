import { useParams } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'

import { useBranchSelector } from './useBranchSelector'

export function useSummary() {
  const { repo, owner, provider, branch } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { data, isLoading: isLoadingRepoCoverage } = useRepoCoverage({
    provider,
    repo,
    owner,
    branch,
  })
  const { selection, branchSelectorProps, newPath, enableRedirection } =
    useBranchSelector(overview?.branches, overview?.defaultBranch)

  return {
    isLoading: isLoading && isLoadingRepoCoverage,
    data,
    branchSelectorProps,
    newPath,
    enableRedirection,
    currenBranchSelected: selection,
    defaultBranch: overview?.defaultBranch,
    privateRepo: overview?.private,
  }
}
