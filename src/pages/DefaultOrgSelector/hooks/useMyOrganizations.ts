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
      owner: z.object({
        username: z.string().nullable(),
        avatarUrl: z.string(),
        ownerid: z.number(),
      }),
      myOrganizations: z.object({
        edges: z.array(
          z.object({
            node: z.object({
              avatarUrl: z.string(),
              username: z.string().nullable(),
              ownerid: z.number().nullable(),
            }),
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
export type MyOrganizationsData = z.infer<typeof MyOrganizationsConfig>

const query = `
query UseMyOrganizations($after: String) {
  me {
    owner {
      username
      avatarUrl
      ownerid
    }
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
}`

interface ParamTypes {
  provider?: string
}

export function useMyOrganizations(options = {}) {
  const { provider } = useParams<ParamTypes>()

  return useInfiniteQuery({
    queryKey: ['UseMyOrganizations', provider],
    queryFn: async ({ signal, pageParam: after }) => {
      try {
        assertIsString(provider)
        const { data } = await Api.graphql({
          provider,
          query,
          signal,
          variables: { after },
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
