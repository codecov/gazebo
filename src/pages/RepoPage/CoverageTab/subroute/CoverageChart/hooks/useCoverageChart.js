import { useParams } from 'react-router-dom'

import {
  useBranchSelector,
  useRepoCoverageTimeseries,
} from 'pages/RepoPage/CoverageTab/hooks'
import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'

const useCoverageChart = () => {
  const { provider, owner, repo } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { data: branchesData } = useBranches({ repo, provider, owner })
  const { selection } = useBranchSelector({
    branches: branchesData?.branches,
    defaultBranch: overview?.defaultBranch,
  })

  return useRepoCoverageTimeseries(
    {
      branch: selection?.name,
    },
    {
      enabled: !!selection?.name,
      suspense: false,
      keepPreviousData: true,
    }
  )
}

export { useCoverageChart }
