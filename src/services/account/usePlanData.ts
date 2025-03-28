import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { BillingRate, Plans } from 'shared/utils/billing'

export const TrialStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  ONGOING: 'ONGOING',
  EXPIRED: 'EXPIRED',
  CANNOT_TRIAL: 'CANNOT_TRIAL',
} as const

export type TrialStatus = (typeof TrialStatuses)[keyof typeof TrialStatuses]

const PlanSchema = z.object({
  baseUnitPrice: z.number(),
  benefits: z.array(z.string()),
  billingRate: z.nativeEnum(BillingRate).nullish(),
  marketingName: z.string(),
  monthlyUploadLimit: z.number().nullable(),
  value: z.nativeEnum(Plans),
  pretrialUsersCount: z.number().nullable(),
  trialEndDate: z.string().nullable(),
  trialStatus: z.nativeEnum(TrialStatuses),
  trialStartDate: z.string().nullable(),
  trialTotalDays: z.number().nullable(),
  planUserCount: z.number().nullable(),
  hasSeatsLeft: z.boolean(),
  isEnterprisePlan: z.boolean(),
  isFreePlan: z.boolean(),
  isProPlan: z.boolean(),
  isTeamPlan: z.boolean(),
  isTrialPlan: z.boolean(),
  isSentryPlan: z.boolean(),
})

export type Plan = z.infer<typeof PlanSchema>

const PretrialPlanSchema = z.object({
  baseUnitPrice: z.number(),
  benefits: z.array(z.string()),
  billingRate: z.nativeEnum(BillingRate).nullish(),
  marketingName: z.string(),
  monthlyUploadLimit: z.number().nullable(),
  value: z.string(),
})

export type PretrialPlan = z.infer<typeof PretrialPlanSchema>

export const PlanDataSchema = z
  .object({
    owner: z
      .object({
        hasPrivateRepos: z.boolean().nullish(),
        plan: PlanSchema.nullish(),
        pretrialPlan: PretrialPlanSchema.nullish(),
      })
      .nullish(),
  })
  .nullish()

export interface UsePlanDataArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

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
        hasSeatsLeft
        isEnterprisePlan
        isFreePlan
        isProPlan
        isSentryPlan
        isTeamPlan
        isTrialPlan
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

export const usePlanData = ({ provider, owner, opts }: UsePlanDataArgs) =>
  useQuery({
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
        const callingFn = 'usePlanData'
        const parsedRes = PlanDataSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes.data?.owner ?? null
      }),
    ...(!!opts && opts),
  })
