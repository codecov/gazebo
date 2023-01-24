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

  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['MyContexts', provider],
    queryFn: ({ pageParam, signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { after: pageParam },
      }).then((res) => {
        return {
          currentUser: res?.data?.me.owner,
          myOrganizations: mapEdges(res?.data?.me.myOrganizations),
          pageInfo: res?.data?.me.myOrganizations.pageInfo,
        }
      }),
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data?.pageInfo?.endCursor : undefined,
    ...opts,
  })

  return {
    data: {
      currentUser: data?.pages?.find(() => true)?.currentUser,
      myOrganizations: data?.pages?.map((page) => page?.myOrganizations).flat(),
    },
    ...rest,
  }
}
