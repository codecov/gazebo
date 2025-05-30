import { infiniteQueryOptions as infiniteQueryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { OrderingDirection } from 'types'

import Api from 'shared/api/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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

interface InfiniteAccountOrganizationsQueryArgs {
  provider: string
  owner: string
  first?: number
  orderingDirection?: OrderingDirection
}

export function InfiniteAccountOrganizationsQueryOpts({
  provider,
  owner,
  first = 20,
  orderingDirection = 'DESC',
}: InfiniteAccountOrganizationsQueryArgs) {
  const variables = {
    first,
    direction: orderingDirection,
  }

  return infiniteQueryOptionsV5({
    queryKey: ['InfiniteAccountOrganizations', provider, owner, variables],
    queryFn: ({ pageParam, signal }) => {
      const after = pageParam ? pageParam : undefined

      return Api.graphql({
        provider,
        signal,
        query,
        variables: {
          ...variables,
          owner,
          after,
        },
      }).then((res) => {
        const callingFn = 'InfiniteAccountOrganizationsQueryOpts'
        const parsedRes = RequestSchema.safeParse(res.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const account = parsedRes?.data?.owner?.account

        if (!account) {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        return {
          organizations: mapEdges(account.organizations),
          pageInfo: account.organizations.pageInfo,
        }
      })
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      return data?.pageInfo?.hasNextPage ? data?.pageInfo?.endCursor : undefined
    },
  })
}
