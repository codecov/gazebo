import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'

import { useBundleBranchSelector } from './useBundleBranchSelector'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export const useBundleSummary = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>()

  const { data: overview, isLoading } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const {
    data: branchList,
    isFetching: branchListIsFetching,
    hasNextPage: branchListHasNextPage,
    fetchNextPage: branchListFetchNextPage,
  } = useBranches({
    repo,
    owner,
    provider,
    filters: { searchValue: branchSearchTerm },
    opts: {
      suspense: false,
    },
  })

  const { data: branchesData, fetchNextPage: branchesFetchNextPage } =
    useBranches({ repo, owner, provider })

  const { selection, branchSelectorProps } = useBundleBranchSelector({
    branches: branchesData?.branches,
    defaultBranch: overview?.defaultBranch ?? '',
  })

  return {
    isLoading: isLoading,
    branchSelectorProps,
    currentBranchSelected: selection,
    defaultBranch: overview?.defaultBranch,
    privateRepo: overview?.private,
    branchesFetchNextPage,
    branchList: branchList?.branches || [],
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchSearchTerm,
  }
}
