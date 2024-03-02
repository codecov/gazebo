import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const InvoiceSchema = z
  .object({
    created: z.number(),
    dueDate: z.number(),
    total: z.number(),
    invoicePdf: z.string(),
  })
  .nullable()

export const SubscriptionDetailSchema = z
  .object({
    latestInvoice: InvoiceSchema,
    defaultPaymentMethod: z
      .object({
        card: z.object({
          brand: z.string(),
          expMonth: z.number(),
          expYear: z.number(),
          last4: z.string(),
        }),
      })
      .nullable(),
    trialEnd: z.number(),
    currentPeriodEnd: z.number(),
    cancelAtPeriodEnd: z.boolean(),
    customer: z
      .object({
        discount: z.number(),
        email: z.string(),
      })
      .nullable(),
    collectionMethod: z.string(),
  })
  .nullable()

export const PlanSchema = z.object({
  baseUnitPrice: z.number(),
  benefits: z.array(z.string()),
  billingRate: z.string().nullable(),
  marketingName: z.string(),
  monthlyUploadLimit: z.number().nullish(),
  value: z.string(),
  quantity: z.number(),
})

export const AccountDetailsSchema = z.object({
  integrationId: z.string().nullable(),
  activatedStudentCount: z.number(),
  activatedUserCount: z.number(),
  checkoutSessionId: z.string().nullable(),
  email: z.string().nullable(),
  inactiveUserCount: z.number(),
  name: z.string(),
  plan: PlanSchema,
  planAutoActivate: z.boolean(),
  planProvider: z.string().nullable(),
  usesInvoice: z.boolean(),
  repoTotalCredits: z.number(),
  rootOrganization: z
    .object({
      plan: PlanSchema,
    })
    .nullable(),
  scheduleDetail: z
    .object({
      scheduledPhase: z.object({
        quantity: z.number(),
        plan: z.string(),
        startDate: z.number(),
      }),
    })
    .nullable(),
  studentCount: z.number(),
  subscriptionDetail: SubscriptionDetailSchema,
})

export interface UseAccountDetailsArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

function getPathAccountDetails({
  provider,
  owner,
}: {
  provider: string
  owner: string
}) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({
  provider,
  owner,
  signal,
}: {
  provider: string
  owner: string
  signal?: AbortSignal
}) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider, signal })
}

export function useAccountDetails({
  provider,
  owner,
  opts = {},
}: UseAccountDetailsArgs) {
  return useQuery({
    queryKey: ['accountDetails', provider, owner],
    queryFn: ({ signal }) =>
      fetchAccountDetails({ provider, owner, signal }).then((res) => {
        const parsedRes = AccountDetailsSchema.safeParse(res)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data
      }),
    ...opts,
  })
}
