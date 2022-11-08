import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoCoverage, useRepoOverview } from 'services/repo'

import { useBranchSelector } from '../../hooks'

export function useSummary() {
  const { repo, owner, provider } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const {
    data: branchesData,
    isFetching: branchesIsFetching,
    hasNextPage: branchesHasNextPage,
    fetchNextPage: branchesFetchNextPage,
  } = useBranches({ repo, owner, provider })

  const { selection, branchSelectorProps } = useBranchSelector(
    branchesData?.branches,
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
    branchesIsFetching,
    branchesHasNextPage,
    branchesFetchNextPage,
  }
}
