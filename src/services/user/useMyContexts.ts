import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
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

  return useInfiniteQuery({
    queryKey: ['MyContexts', provider, query],
    queryFn: ({ pageParam, signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { after: pageParam },
      }).then((res) => {
        const parsedRes = MyContextsSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useMyContexts - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        return parsedRes?.data
      }),
    select: ({ pages, pageParams }) => {
      const me = pages[0]?.me ?? null
      const myOrganizations = pages.map((page) => page?.me?.myOrganizations)
      const flatOrganizations = myOrganizations.flatMap((page) =>
        mapEdges(page)
      )

      return {
        pages,
        pageParams,
        currentUser: me?.owner ?? null,
        myOrganizations: flatOrganizations,
        pageInfo: myOrganizations[myOrganizations.length - 1]?.pageInfo,
      }
    },
    getNextPageParam: (data) => {
      const myOrganizations = data?.me?.myOrganizations
      return myOrganizations?.pageInfo?.hasNextPage
        ? myOrganizations?.pageInfo?.endCursor
        : undefined
    },
    ...opts,
  })
}
