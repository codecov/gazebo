import { useQuery } from '@tanstack/react-query'
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
    hasPrivateRepos: z.boolean(),
    plan: z
      .object({
        baseUnitPrice: z.number(),
        benefits: z.array(z.string()),
        billingRate: z.string().nullable(),
        marketingName: z.string(),
        monthlyUploadLimit: z.number().nullable(),
        value: z.string(),
        pretrialUsersCount: z.number().nullable(),
        trialEndDate: z.string().nullable(),
        trialStatus: z.nativeEnum(TrialStatuses),
        trialStartDate: z.string().nullable(),
        trialTotalDays: z.number().nullable(),
        planUserCount: z.number(),
      })
      .nullish(),
    pretrialPlan: z
      .object({
        baseUnitPrice: z.number(),
        benefits: z.array(z.string()),
        billingRate: z.string().nullable(),
        marketingName: z.string(),
        monthlyUploadLimit: z.number().nullable(),
        value: z.string(),
      })
      .nullish(),
  })
  .nullish()

export const query = `
  query GetPlanData($owner: String!) {
    owner(username: $owner) {
      hasPrivateRepos
      plan {
        baseUnitPrice
        benefits
        billingRate
        marketingName
        monthlyUploadLimit
        value
        pretrialUsersCount
        trialEndDate
        trialStatus
        trialStartDate
        trialTotalDays
        planUserCount
      }
      pretrialPlan {
        baseUnitPrice
        benefits
        billingRate
        marketingName
        monthlyUploadLimit
        value
      }
    }
  }
`

export interface UseTrialArgs {
  provider: string
  owner: string
  opts?: {
    enabled: boolean
  }
}

export const usePlanData = ({ provider, owner, opts }: UseTrialArgs) => {
  return useQuery({
    queryKey: ['GetPlanData', provider, owner, query],
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
}
