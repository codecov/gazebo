import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const OwnerSchema = z.object({
  hasActiveRepos: z.boolean().nullish(),
  hasPublicRepos: z.boolean().nullish(),
})

export type Owner = z.infer<typeof OwnerSchema>

const RequestSchema = z.object({
  owner: OwnerSchema.nullish(),
})

interface TokenlessQueryArgs {
  username?: string
  provider: Provider
  opts?: {
    suspense?: boolean
    enabled?: boolean
  }
}

const query = `query OwnerTokenlessData {
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
    queryKey: ['OwnerTokenlessData', variables, provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        variables,
        signal,
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'TokenlessQueryOpts',
              error: parsedData.error,
            },
          })
        }

        return parsedData?.data?.owner
      }),
    ...opts,
  })
}
