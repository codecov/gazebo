import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useBranch, query as useBranchQuery } from 'services/branches/useBranch'

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
  const [branchTerm, setBranchTerm] = useState('')

  const {
    data: branchList,
    isFetching: branchListIsFetching,
    hasNextPage: branchListHasNextPage,
    fetchNextPage: branchListFetchNextPage,
  } = useBranches({
    repo,
    owner,
    provider,
    filters: { searchValue: branchTerm },
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

  const { data: branchValue } = useBranch({
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

  let selection = branchValue?.branch?.name
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
    setBranchTerm,
    isSearching: branchTerm !== '',
  }
}
