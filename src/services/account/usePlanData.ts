import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const TrialStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  ONGOING: 'ONGOING',
  EXPIRED: 'EXPIRED',
  CANNOT_TRIAL: 'CANNOT_TRIAL',
} as const

const PlanDataSchema = z
  .object({
    plan: z
      .object({
        baseUnitPrice: z.number(),
        benefits: z.array(z.string()),
        billingRate: z.string().nullable(),
        marketingName: z.string(),
        monthlyUploadLimit: z.number().nullable(),
        planName: z.string(),
        trialStatus: z.nativeEnum(TrialStatuses),
        trialStartDate: z.string().nullable(),
        trialEndDate: z.string().nullable(),
      })
      .nullish(),
  })
  .nullish()

type TPlanData = z.infer<typeof PlanDataSchema>

export interface UseTrialArgs {
  provider: string
  owner: string
  opts?: UseQueryOptions<TPlanData>
}

export const query = `
  query GetPlanData($owner: String!) {
    owner(username: $owner) {
      plan {
        baseUnitPrice
        benefits
        billingRate
        marketingName
        monthlyUploadLimit
        planName
        trialStatus
        trialStartDate
        trialEndDate
      }
    }
  }
`

export const usePlanData = ({ provider, owner, opts }: UseTrialArgs) =>
  useQuery({
    queryKey: ['GetTrialData', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = PlanDataSchema?.safeParse(res?.data?.owner)

        if (!parsedRes.success) {
          return {}
        }

        return parsedRes.data
      }),
    ...(!!opts && opts),
  })
