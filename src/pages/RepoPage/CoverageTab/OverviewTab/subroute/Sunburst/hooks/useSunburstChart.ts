import { useQuery } from '@tanstack/react-queryV5'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import { SunburstCoverageQueryOpts } from 'services/charts/SunburstCoverageQueryOpts'
import { useRepoOverview } from 'services/repo'
import { Provider } from 'shared/api/helpers'

interface URLParams {
  provider: Provider
  owner: string
  repo: string
  branch: string
}

const useSunburstChart = () => {
  const { provider, owner, repo, branch } = useParams<URLParams>()
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

  const flags = queryParams?.flags as string[] | undefined
  const components = queryParams?.components as string[] | undefined

  const currentBranch = branch
    ? decodeURIComponent(branch)
    : overview?.defaultBranch
      ? overview?.defaultBranch
      : ''

  return useQuery({
    ...SunburstCoverageQueryOpts({
      provider,
      owner,
      repo,
      query: { branch: currentBranch, flags, components },
    }),
    enabled: !!currentBranch,
    select: (data) => (data ? { name: repo, children: data } : null),
  })
}

export default useSunburstChart
