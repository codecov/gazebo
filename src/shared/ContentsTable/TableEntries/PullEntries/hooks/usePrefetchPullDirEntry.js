import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

const query = `
  query CommitPathContents(
    $owner: String!
    $repo: String!
    $pullId: Int!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $owner) {
      username
      repository(name: $repo) {
        pull(id: $pullId) {
          head {
            pathContents(path: $path, filters: $filters) {
              ... on PathContents {
                results {
                  __typename
                  hits
                  misses
                  partials
                  lines
                  name
                  path
                  percentCovered
                  ... on PathContentFile {
                    isCriticalFile
                  }
                }
                __typename
              }
            }
          }
        }
      }
    }
  }
`

export function usePrefetchPullDirEntry({ pullId, path, filters, opts = {} }) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['PullPathContents', provider, owner, repo, pullId, path, filters],
      ({ signal }) =>
        Api.graphql({
          provider,
          query,
          signal,
          variables: {
            owner,
            repo,
            pullId,
            path,
            filters,
          },
        }).then(
          (res) => res?.data?.owner?.repository?.pull?.head?.pathContents
        ),
      {
        staleTime: 10000,
        ...opts,
      }
    )

  return { runPrefetch }
}
