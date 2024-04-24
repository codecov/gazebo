import qs from 'qs'
import { useLocation , useParams } from 'react-router-dom'

import { useSunburstCoverage } from 'services/charts'
import { useRepoOverview } from 'services/repo'

const useSunburstChart = () => {
  const { provider, owner, repo, branch } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const flags = queryParams?.flags
  const components = queryParams?.components

  const currentBranch = branch
    ? decodeURIComponent(branch)
    : overview?.defaultBranch

  return useSunburstCoverage(
    {
      provider,
      owner,
      repo,
      query: { branch: currentBranch, flags, components },
    },
    {
      enabled: !!currentBranch,
      suspense: false,
      select: (data) => data && { name: repo, children: data },
    }
  )
}

export default useSunburstChart
