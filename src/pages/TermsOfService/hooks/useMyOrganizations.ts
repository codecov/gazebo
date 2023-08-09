import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { assertIsError, assertIsString } from 'shared/asserts'

function caughtServiceError(hook: string, error: unknown) {
  assertIsError(error)
  console.error(`Error at ${hook}: ${error?.message}`)
}

export const MyOrganizationsConfig = z.object({
  me: z
    .object({
      myOrganizations: z.object({
        edges: z.array(
          z.object({
            node: z.object({
              avatarUrl: z.string().url('not a valid url').nullish(),
              username: z.string().nullish(),
              ownerid: z.number().nullish(),
            }),
          })
        ),
        pageInfo: z.object({
          hasNextPage: z.boolean().nullish(),
          endCursor: z.string().nullish(),
        }),
      }),
    })
    .nullish(),
})
export type MyOrganizationsData = z.infer<typeof MyOrganizationsConfig>

const query = `
query UseMyOrganizations($after: String) {
  me {
    myOrganizations(first: 20, after: $after) {
      edges {
        node {
          avatarUrl
          username
          ownerid
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
interface ParamTypes {
  provider?: string
}

export function useMyOrganizations(options = {}) {
  const { provider } = useParams<ParamTypes>()

  return useInfiniteQuery({
    queryKey: ['UseMyOrganizations', provider],
    queryFn: async ({ signal }) => {
      try {
        assertIsString(provider)
        const { data } = await Api.graphql({
          provider,
          query,
          signal,
        })

        const currentUser = data?.me

        if (!currentUser) {
          throw new Error('Unauthenticated')
        }

        return data
      } catch (error) {
        caughtServiceError('useMyOrganizations', error)
      }
    },
    getNextPageParam: (data) => {
      const endCursor = data?.me?.myOrganizations?.pageInfo?.hasNextPage
        ? data?.me?.myOrganizations?.pageInfo?.endCursor
        : undefined
      return endCursor
    },
    enabled: !!provider,
    ...options,
  })
}
