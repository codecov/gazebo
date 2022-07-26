import { useInfiniteQuery } from 'react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

import { mapEdges } from '../../shared/utils/graphql'

function fetchRepoFlags({ provider, owner: name, repo, filters, after }) {
  const query = `
    query FlagsSelect(
      $name: String!
      $repo: String!
      $filters: FlagSetFilters!
      $after: String
    ) {
      owner(username: $name) {
        repository(name: $repo) {
          flags(filters: $filters, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }
   `
  return Api.graphql({
    provider,
    query,
    variables: {
      name,
      repo,
      filters,
      after,
    },
  }).then((res) => {
    const flags = res?.data?.owner?.repository?.flags

    return {
      flags: mapEdges(flags),
      pageInfo: flags?.pageInfo,
    }
  })
}

export function useRepoFlagsSelect({ filters } = { filters: {} }) {
  const { provider, owner, repo } = useParams()

  const { data, ...rest } = useInfiniteQuery(
    ['RepoFlagsSelect', provider, owner, repo, filters],
    ({ pageParam: after }) =>
      fetchRepoFlags({
        provider,
        owner,
        repo,
        filters,
        after,
      }),
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    }
  )
  return {
    data: data?.pages?.map((page) => page?.flags).flat(),
    ...rest,
  }
}
