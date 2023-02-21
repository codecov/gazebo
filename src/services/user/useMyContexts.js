import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

export function useMyContexts({ provider, opts = {} }) {
  const query = `
    query MyContexts($after: String) {
      me {
        owner {
          username
          avatarUrl
          defaultOrgUsername
        }
        myOrganizations(first: 20, after: $after) {
          edges {
            node {
              username
              avatarUrl
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  return useInfiniteQuery({
    queryKey: ['MyContexts', provider, query],
    queryFn: ({ pageParam, signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { after: pageParam },
      }),
    select: ({ pages }) => {
      const me = pages?.at(-1)?.data?.me
      const myOrganizations = pages?.map(
        (page) => page?.data?.me?.myOrganizations
      )
      const flatOrganizations = myOrganizations.flatMap((page) =>
        mapEdges(page)
      )
      return {
        currentUser: me?.owner,
        myOrganizations: flatOrganizations,
        pageInfo: me?.myOrganizations?.pageInfo,
      }
    },
    getNextPageParam: ({ data }) => {
      const myOrganizations = data?.me?.myOrganizations
      return myOrganizations?.pageInfo?.hasNextPage
        ? myOrganizations?.pageInfo?.endCursor
        : undefined
    },
    ...opts,
  })
}
