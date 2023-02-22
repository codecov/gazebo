import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/file/utils'
import Api from 'shared/api'

const query = `
query CoverageForFile(
  $owner: String!
  $repo: String!
  $ref: String!
  $path: String!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      commit(id: $ref) {
        commitid
        flagNames
        coverageFile(path: $path) {
          hashedPath
          isCriticalFile
          content
          coverage {
            line
            coverage
          }
          totals {
            coverage # Absolute coverage of the commit
          }
        }
      }
    }
  }
}
`

export function usePrefetchPullFileEntry({ ref, path, options = {} }) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['commit', provider, owner, repo, ref, path],
      () =>
        Api.graphql({
          provider,
          query,
          variables: {
            provider,
            owner,
            repo,
            path,
          },
        }).then(extractCoverageFromResponse),
      {
        staleTime: 10000,
        ...options,
      }
    )

  return { runPrefetch }
}
