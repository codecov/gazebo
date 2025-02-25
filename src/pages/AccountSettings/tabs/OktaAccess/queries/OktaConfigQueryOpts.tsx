import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

export const OktaConfigSchema = z.object({
  enabled: z.boolean(),
  enforced: z.boolean(),
  url: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
})

const AccountSchema = z.object({
  oktaConfig: OktaConfigSchema.nullable(),
})

const OwnerSchema = z.object({
  isUserOktaAuthenticated: z.boolean().nullable(),
  account: AccountSchema.nullable(),
})

const OktaConfigRequestSchema = z.object({
  owner: OwnerSchema.nullable(),
})

const oktaConfigQuery = `
query GetOktaConfig($username: String!) {
  owner(username: $username) {
    isUserOktaAuthenticated
    account {
      oktaConfig {
        enabled
        enforced
        url
        clientId
        clientSecret
      }
    }
  }
}
`

interface OktaConfigQueryArgs {
  provider: string
  username: string
}

export function OktaConfigQueryOpts({
  provider,
  username,
}: OktaConfigQueryArgs) {
  return queryOptionsV5({
    queryKey: ['GetOktaConfig', provider, username, oktaConfigQuery],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        query: oktaConfigQuery,
        signal,
        variables: {
          username,
        },
      }).then((res) => {
        const callingFn = 'OktaConfigQueryOpts'
        const parsedRes = OktaConfigRequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes.data
      })
    },
  })
}
