import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

interface URLParams {
  provider: string
}

export const DetailOwnerSchema = z
  .object({
    owner: z
      .object({
        ownerid: z.string().nullish(),
        username: z.string().nullish(),
        avatarUrl: z.string().nullish(),
        isCurrentUserPartOfOrg: z.boolean().nullish(),
        isAdmin: z.boolean().nullish(),
      })
      .nullable(),
  })
  .nullable()

export function useOwner({
  username,
  opts = { enabled: username !== undefined },
}: {
  username?: string
  opts?: {
    enabled: boolean
  }
}) {
  const { provider } = useParams<URLParams>()
  const query = `
    query DetailOwner($username: String!) {
      owner(username: $username) {
        ownerid
        username
        avatarUrl
        isCurrentUserPartOfOrg
        isAdmin
      }
    }
  `

  const variables = {
    username,
  }

  return useQuery({
    queryKey: ['owner', variables, provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        const parsedData = DetailOwnerSchema.safeParse(res?.data)
        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useOwner - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedData.data?.owner
      }),
    ...opts,
  })
}
