import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoCoverage, useRepoOverview } from 'services/repo'

import { useBranchSelector } from '../hooks'

export function useSummary() {
  const [branchSearchTerm, setBranchSearchTerm] = useState()
  const { repo, owner, provider } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
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

  const { selection, branchSelectorProps } = useBranchSelector({
    branches: branchesData?.branches,
    defaultBranch: overview?.defaultBranch,
  })

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
    branchesFetchNextPage,
    branchList: branchList?.branches || [],
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchSearchTerm,
  }
}
