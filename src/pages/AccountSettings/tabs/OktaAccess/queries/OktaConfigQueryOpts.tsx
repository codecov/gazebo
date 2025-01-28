import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

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
        const parsedRes = OktaConfigRequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useOktaConfig - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data
      })
    },
  })
}
