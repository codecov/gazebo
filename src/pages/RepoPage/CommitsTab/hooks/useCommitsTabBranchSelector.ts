import { useState } from 'react'
import { useParams } from 'react-router-dom'

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
    data: branchesData,
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

  const selectedBranch = passedBranch ?? defaultBranch

  // Check if the selected branch exists in the branches list
  const branchExists = branchesData?.branches?.some(
    (branch) => branch?.name === selectedBranch
  )

  let selection = selectedBranch
  if (isAllCommits) {
    selection = 'All branches'
  } else if (!branchExists) {
    selection = 'Select branch'
  }

  return {
    selection,
    branchSelectorProps: {
      items: branchesData?.branches?.map((branch) => branch?.name) || [],
      value: selection,
    },
    currentBranchSelected: selection,
    branchList: branchesData?.branches?.map((branch) => branch?.name) || [],
    branchListIsFetching,
    branchListHasNextPage,
    branchListFetchNextPage,
    setBranchSearchTerm,
    isSearching: branchSearchTerm !== '',
  }
}
