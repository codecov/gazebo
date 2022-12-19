import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query CommitFiles(
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

export const useRepoCommitContents = ({
  provider,
  owner,
  repo,
  commitSha,
  path,
  filters,
  opts = {},
}) => {
  return useQuery(
    ['CommitFiles', provider, owner, repo, commitSha, path, filters],
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
    opts
  )
}
