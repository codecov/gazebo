import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const AccountSchema = z.object({
  name: z.string(),
  totalSeatCount: z.number(),
  activatedUserCount: z.number(),
  organizations: z.object({
    totalCount: z.number(),
  }),
})

export type Account = z.infer<typeof AccountSchema>

const RequestSchema = z.object({
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

interface UseEnterpriseAccountDetailsArgs {
  provider: string
  owner: string
}

export function useEnterpriseAccountDetails({
  provider,
  owner,
}: UseEnterpriseAccountDetailsArgs) {
  return useQuery({
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
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useEnterpriseAccountDetails - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data
      }),
  })
}
