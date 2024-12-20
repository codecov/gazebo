import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const OwnerSchema = z.object({
  ownerid: z.number().nullish(),
  username: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  isCurrentUserPartOfOrg: z.boolean().nullish(),
  isAdmin: z.boolean().nullish(),
})

export type Owner = z.infer<typeof OwnerSchema>

const RequestSchema = z.object({
  owner: OwnerSchema.nullish(),
})

interface URLParams {
  provider: string
}

interface UseOwnerArgs {
  username?: string
  opts?: {
    suspense?: boolean
    enabled?: boolean
  }
}

export function useOwner({
  username,
  opts = { enabled: username !== undefined },
}: UseOwnerArgs) {
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
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useOwner - 404 Failed to parse data',
            error: parsedRes.error,
          })
        }

        return res?.data?.owner
      }),
    ...opts,
  })
}
