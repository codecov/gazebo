import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { FileComparisonWithBase } from './fragments'
import { transformImpactedFileData } from './utils'

const query = `
    query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!, $filters: SegmentsFilters) {
      owner(username: $owner) {
        repository(name: $repo) {
          pull(id: $pullId) {
            ...FileComparisonWithBase
          }
        }
      }
    }

    ${FileComparisonWithBase}
`

export function useSingularImpactedFileComparison({
  provider,
  owner,
  repo,
  pullId,
  path,
  filters = {},
}) {
  return useQuery(
    ['ImpactedFileComparison', provider, owner, repo, pullId, path, filters],
    ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          path,
          filters,
        },
      }).then((res) =>
        transformImpactedFileData(
          res?.data?.owner?.repository?.pull?.compareWithBase?.impactedFile
        )
      ),
    {
      suspense: false,
    }
  )
}
