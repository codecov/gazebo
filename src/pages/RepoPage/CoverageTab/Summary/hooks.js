import { useParams } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'
import { mapEdges } from 'shared/utils/graphql'

export function useSummary() {
  const { repo, owner, provider } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const branch = overview?.defaultBranch // TODO or check local storage
  const {
    data,
    isLoading: isLoadingRepoCoverage,
    ...rest
  } = useRepoCoverage({
    provider,
    repo,
    owner,
    branch,
  })

  return {
    isLoading: isLoading && isLoadingRepoCoverage,
    data,
    branches: mapEdges(overview?.branches),
    defaultBranch: branch,
    coverage: overview?.coverage,
    ...rest,
  }
}
