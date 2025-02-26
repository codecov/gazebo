import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const OwnerSchema = z.object({
  hasActiveRepos: z.boolean(),
  hasPublicRepos: z.boolean(),
})

export type Owner = z.infer<typeof OwnerSchema>

const RequestSchema = z.object({
  owner: OwnerSchema.nullable(),
})

interface TokenlessQueryArgs {
  username?: string
  provider: Provider
  opts?: {
    suspense?: boolean
    enabled?: boolean
  }
}

const query = `query OwnerTokenlessData($username: String!) {
  owner(username: $username) {
    hasActiveRepos
    hasPublicRepos
  }
}
`

export function TokenlessQueryOpts({
  username,
  provider,
  opts = { enabled: username !== undefined },
}: TokenlessQueryArgs) {
  const variables = { username }
  return queryOptionsV5({
    queryKey: ['OwnerTokenlessData', variables, provider],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        variables,
        signal,
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'TokenlessQueryOpts',
              error: parsedRes.error,
            },
          })
        }

        return parsedRes?.data?.owner ?? null
      }),
    ...opts,
  })
}
