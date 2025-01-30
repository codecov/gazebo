import { useQuery } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { Plans } from 'shared/utils/billing'

const PlanSchema = z.object({
  value: z.nativeEnum(Plans),
})

const UnverifiedPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
  hostedVerificationUrl: z.string(),
})

export const CurrentOrgPlanPageDataSchema = z
  .object({
    owner: z
      .object({
        plan: PlanSchema.nullish(),
        billing: z
          .object({
            unverifiedPaymentMethods: z.array(UnverifiedPaymentMethodSchema),
          })
          .nullish(),
      })
      .nullish(),
  })
  .nullish()

export interface UseCurrentOrgPlanPageDataArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

export const query = `
  query GetCurrentOrgPlanPageData($owner: String!) {
    owner(username: $owner) {
      plan {
        value
      }
      billing {
        unverifiedPaymentMethods {
          paymentMethodId
          hostedVerificationUrl
        }
      }
    }
  }
`

export const useCurrentOrgPlanPageData = ({
  provider,
  owner,
  opts,
}: UseCurrentOrgPlanPageDataArgs) =>
  useQuery({
    queryKey: ['GetCurrentOrgPlanPageData', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = CurrentOrgPlanPageDataSchema.safeParse(res?.data)
        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.owner ?? null
      }),
    ...(!!opts && opts),
  })
