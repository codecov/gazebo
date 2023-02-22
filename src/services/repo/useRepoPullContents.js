import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query PullPathContents(
    $owner: String!,
    $repo: String!,
    $pullId: Int!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
        repositoryConfig {
          indicationRange {
            upperRange
            lowerRange
          }
        }
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

export const useRepoPullContents = ({
  provider,
  owner,
  repo,
  pullId,
  path,
  filters,
  opts = {},
}) => {
  return useQuery({
    queryKey: [
      'PullPathContents',
      provider,
      owner,
      repo,
      pullId,
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
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          path,
          filters,
        },
      }).then((res) => {
        return {
          results:
            res?.data?.owner?.repository?.pull?.head?.pathContents?.results,
          indicationRange:
            res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
        }
      }),
    ...opts,
  })
}
