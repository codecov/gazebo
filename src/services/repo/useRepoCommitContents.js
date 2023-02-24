import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query CommitPathContents(
    $name: String!
    $commit: String!
    $repo: String!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $name) {
      username
      repository(name: $repo) {
        repositoryConfig {
          indicationRange {
            upperRange
            lowerRange
          }
        }
        commit(id: $commit) {
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
  commit,
  path,
  filters,
  opts = {},
}) => {
  return useQuery({
    queryKey: [
      'CommitPathContents',
      provider,
      owner,
      repo,
      commit,
      path,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
          commit,
          path,
          filters,
        },
      }).then((res) => ({
        results: res?.data?.owner?.repository?.commit?.pathContents?.results,
        indicationRange:
          res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
      })),
    ...opts,
  })
}
