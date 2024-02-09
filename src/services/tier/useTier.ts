import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const TierNames = {
  BASIC: 'basic',
  TEAM: 'team',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export type TTierNames = (typeof TierNames)[keyof typeof TierNames]

export const TierSchema = z
  .object({
    owner: z
      .object({
        plan: z
          .object({
            tierName: z.nativeEnum(TierNames),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

export interface UseTierArgs {
  provider: string
  owner: string
}

const query = `
  query OwnerTier($owner: String!) {
    owner(username:$owner){
      plan {
        tierName
      }
    }
  }
`

export const useTier = ({ provider, owner }: UseTierArgs) =>
  useQuery({
    queryKey: ['OwnerTier', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = TierSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.owner?.plan?.tierName ?? null
      }),
  })
