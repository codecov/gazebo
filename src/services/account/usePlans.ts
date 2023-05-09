import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const planSchema = z.object({
  marketingName: z.string(),
  // this should be replaced with the plan types once
  // we have converted utils/billing over to TS
  value: z.string(),
  billingRate: z
    .union([z.literal('monthly'), z.literal('annually')])
    .nullable(),
  baseUnitPrice: z.number(),
  monthlyUploadsLimit: z.number().nullish(),
  benefits: z.array(z.string()),
})

export type PlanType = z.infer<typeof planSchema>

export function usePlans(provider: string) {
  // the plans are very static data
  return useQuery({
    queryKey: ['plans', provider],
    queryFn: ({ signal }) =>
      Api.get({ path: '/plans', provider, signal }).then((res) =>
        z.array(planSchema).parse(res)
      ),
    cacheTime: Infinity,
    staleTime: Infinity,
  })
}
