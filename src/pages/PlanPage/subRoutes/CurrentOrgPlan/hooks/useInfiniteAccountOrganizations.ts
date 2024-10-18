import { useInfiniteQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { OrderingDirection } from 'types'

import Api from 'shared/api/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import { mapEdges } from 'shared/utils/graphql'

const RequestSchema = z.object({
  owner: z
    .object({
      account: z
        .object({
          organizations: z.object({
            edges: z.array(
              z.object({
                node: z
                  .object({
                    username: z.string().nullable(),
                    activatedUserCount: z.number().nullable(),
                    isCurrentUserPartOfOrg: z.boolean(),
                  })
                  .nullable(),
              })
            ),
            pageInfo: z.object({
              hasNextPage: z.boolean(),
              endCursor: z.string().nullable(),
            }),
          }),
        })
        .nullable(),
    })
    .nullable(),
})

const query = `query InfiniteAccountOrganizations(
  $owner: String!, 
  $after: String, 
  $first: Int!, 
  $direction: OrderingDirection!
) {
  owner(username: $owner) {
    account {
      organizations(
        first: $first
        after: $after
        orderingDirection: $direction
      ) {
        edges {
          node {
            username
            activatedUserCount
            isCurrentUserPartOfOrg
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    activatedUserCount
  }
}`

interface UseInfiniteAccountOrganizationsArgs {
  provider: string
  owner: string
  first?: number
  orderingDirection?: OrderingDirection
}

export function useInfiniteAccountOrganizations({
  provider,
  owner,
  first = 20,
  orderingDirection = 'DESC',
}: UseInfiniteAccountOrganizationsArgs) {
  const variables = {
    first,
    direction: orderingDirection,
  }

  return useInfiniteQuery({
    queryKey: ['InfiniteAccountOrganizations', provider, owner, variables],
    queryFn: ({ pageParam, signal }) =>
      Api.graphql({
        provider,
        signal,
        query,
        variables: {
          ...variables,
          owner,
          after: pageParam,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useInfiniteAccountOrganizations - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const account = parsedRes?.data?.owner?.account

        if (!account) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useInfiniteAccountOrganizations - 404 Cannot find Account for Owner',
          } satisfies NetworkErrorObject)
        }

        return {
          organizations: mapEdges(account.organizations),
          pageInfo: account.organizations.pageInfo,
        }
      }),
    suspense: false,
    getNextPageParam: (data) => data.pageInfo.endCursor,
  })
}
