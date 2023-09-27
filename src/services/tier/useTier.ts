import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const TierNames = {
  BASIC: 'basic',
  LITE: 'lite',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export const TierSchema = z
  .object({
    tierName: z.nativeEnum(TierNames),
  })
  .nullish()

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
        return TierSchema.parse(res?.data?.owner?.plan) ?? {}
      }),
  })
