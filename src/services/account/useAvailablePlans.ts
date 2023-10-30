import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const PlansSchema = z
  .object({
    owner: z
      .object({
        availablePlans: z
          .array(
            z
              .object({
                baseUnitPrice: z.number(),
                benefits: z.array(z.string()),
                billingRate: z.string().nullable(),
                marketingName: z.string(),
                monthlyUploadLimit: z.number().nullable(),
                value: z.string(),
              })
              .nullable()
          )
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

const query = `
  query GetAvailablePlans($owner: String!) {
    owner(username: $owner) {
      availablePlans {
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

export interface UseAvailablePlansArgs {
  provider: string
  owner: string
}

export const useAvailablePlans = ({
  provider,
  owner,
}: UseAvailablePlansArgs) => {
  return useQuery({
    queryKey: ['GetAvailablePlans', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = PlansSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.owner?.availablePlans ?? null
      }),
    staleTime: 1000 * 10,
  })
}
