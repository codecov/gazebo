import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { mapEdges } from 'shared/utils/graphql'

const MyContextsSchema = z.object({
  me: z
    .object({
      owner: z.object({
        username: z.string().nullable(),
        avatarUrl: z.string(),
        defaultOrgUsername: z.string().nullable(),
      }),
      myOrganizations: z.object({
        edges: z.array(
          z.object({
            node: z
              .object({
                username: z.string().nullable(),
                avatarUrl: z.string(),
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

interface UseMyContextsArgs {
  provider: string
  opts?: UseInfiniteQueryOptions<z.infer<typeof MyContextsSchema>>
}

export function useMyContexts({ provider, opts = {} }: UseMyContextsArgs) {
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

  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['MyContexts', provider, query],
    queryFn: ({ pageParam, signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { after: pageParam },
      }).then((res) => {
        const callingFn = 'useMyContexts'
        const parsedRes = MyContextsSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes?.data
      }),
    getNextPageParam: (data) => {
      const myOrganizations = data?.me?.myOrganizations
      return myOrganizations?.pageInfo?.hasNextPage
        ? myOrganizations?.pageInfo?.endCursor
        : undefined
    },
    ...opts,
  })

  return {
    data: useMemo(() => {
      const me = data?.pages[0]?.me ?? null
      const myOrganizations =
        data?.pages.map((page) => page?.me?.myOrganizations) ?? []
      const flatOrganizations = myOrganizations.flatMap((page) =>
        mapEdges(page)
      )

      return {
        currentUser: me?.owner ?? null,
        myOrganizations: flatOrganizations,
        pageInfo: myOrganizations[myOrganizations.length - 1]?.pageInfo,
      }
    }, [data]),
    ...rest,
  }
}
