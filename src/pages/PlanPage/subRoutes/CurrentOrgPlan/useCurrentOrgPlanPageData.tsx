import { useQuery } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'
import { Plans } from 'shared/utils/billing'

const PlanSchema = z.object({
  value: z.nativeEnum(Plans),
})

const UnverifiedPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
  hostedVerificationUrl: z.string().nullish(),
})

const CurrentOrgPlanPageDataSchema = z
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

interface UseCurrentOrgPlanPageDataArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

const query = `
  query CurrentOrgPlanPageData($owner: String!) {
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
    queryKey: ['CurrentOrgPlanPageData', provider, owner, query],
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
          return rejectNetworkError({
            status: 404,
            error: parsedRes.error,
            data: {},
            dev: 'useCurrentOrgPlanPageData - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data?.owner ?? null
      }),
    ...(!!opts && opts),
  })
