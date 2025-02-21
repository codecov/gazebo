import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const AccountSchema = z.object({
  name: z.string(),
  totalSeatCount: z.number(),
  activatedUserCount: z.number(),
  organizations: z.object({
    totalCount: z.number(),
  }),
})

export type Account = z.infer<typeof AccountSchema>

export const EnterpriseAccountDetailsRequestSchema = z.object({
  owner: z
    .object({
      account: AccountSchema.nullable(),
    })
    .nullable(),
})

const query = `query EnterpriseAccountDetails($owner: String!) {
  owner(username: $owner) {
    account {
      name
      totalSeatCount
      activatedUserCount
      organizations {
        totalCount
      }
    }
  }
}`

interface EnterpriseAccountDetailsQueryArgs {
  provider: string
  owner: string
}

export function EnterpriseAccountDetailsQueryOpts({
  provider,
  owner,
}: EnterpriseAccountDetailsQueryArgs) {
  return queryOptionsV5({
    queryKey: ['EnterpriseAccountDetails', provider, owner],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        signal,
        query,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = EnterpriseAccountDetailsRequestSchema.safeParse(
          res?.data
        )

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'EnterpriseAccountDetailsQueryOpts',
              error: parsedRes.error,
            },
          })
        }

        return parsedRes.data
      }),
  })
}
