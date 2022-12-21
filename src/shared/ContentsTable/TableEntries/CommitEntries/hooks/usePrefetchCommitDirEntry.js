import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

const query = `
  query CommitContents(
    $name: String!
    $commitSha: String!
    $repo: String!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $name) {
      username
      repository(name: $repo) {
        commit(id: $commitSha) {
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
`

export function usePrefetchCommitDirEntry({
  commitSha,
  path,
  filters,
  opts = {},
}) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['CommitContents', provider, owner, repo, commitSha, path, filters],
      ({ signal }) =>
        Api.graphql({
          provider,
          query,
          signal,
          variables: {
            name: owner,
            repo,
            commitSha,
            path,
            filters,
          },
        }).then((res) => res?.data?.owner?.repository?.commit?.pathContents),
      {
        staleTime: 10000,
        ...opts,
      }
    )

  return { runPrefetch }
}
