import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranch, query as useBranchQuery } from 'services/branches/useBranch'
import { useBranches } from 'services/branches/useBranches'

interface URLParams {
  repo: string
  owner: string
  provider: string
}

export const useCommitsTabBranchSelector = ({
  passedBranch,
  defaultBranch,
  isAllCommits = false,
}: {
  passedBranch: string
  defaultBranch: string
  isAllCommits?: boolean
}) => {
  const { repo, owner, provider } = useParams<URLParams>()
  const [branchSearchTerm, setBranchSearchTerm] = useState('')

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
    useBranches({
      repo,
      owner,
      provider,
      filters: {},
      opts: { suspense: false },
    })

  const selectedBranch = passedBranch ?? defaultBranch

  const { data: searchBranchValue } = useBranch({
    provider,
    owner,
    repo,
    branch: selectedBranch,
    opts: {
      queryKey: [
        'GetCommitsTabSelectedBranch',
        provider,
        owner,
        repo,
        selectedBranch,
        useBranchQuery,
      ],
      enabled: !!selectedBranch,
    },
  })

  let selection = searchBranchValue?.branch?.name
  if (isAllCommits) {
    selection = 'All branches'
  } else if (!selection) {
    selection = 'Select branch'
  }

  return {
    selection,
    branchSelectorProps: {
      items: branchesData?.branches?.map((branch) => branch?.name) || [],
      value: selection,
    },
    currentBranchSelected: selection,
    branchesFetchNextPage,
    branchList: branchList?.branches?.map((branch) => branch?.name) || [],
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchSearchTerm,
    isSearching: branchSearchTerm !== '',
  }
}
