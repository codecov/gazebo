import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useBranch, query as useBranchQuery } from 'services/branches/useBranch'

interface URLParams {
  repo: string
  owner: string
  provider: string
}

// eslint-disable-next-line max-statements, complexity
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
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>()

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
    selection = 'All Commits'
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
  }
}
