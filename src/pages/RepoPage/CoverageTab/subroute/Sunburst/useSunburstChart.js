import { useParams } from 'react-router-dom'

import { useSunburstCoverage } from 'services/charts'
import { useRepoOverview } from 'services/repo'

const useSunburstChart = () => {
  const { provider, owner, repo, branch } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const currentBranch = branch || overview?.defaultBranch

  return useSunburstCoverage(
    { provider, owner, repo, query: { branch: currentBranch } },
    {
      enabled: !!currentBranch,
      suspense: false,
      select: (data) => data ?? { name: repo, children: data },
    }
  )
}

export default useSunburstChart
