import { QueryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const SelfHostedSeatsAndLicenseSchema = z
  .object({
    config: z
      .object({
        seatsUsed: z.number(),
        seatsLimit: z.number(),
        selfHostedLicense: z
          .object({
            expirationDate: z.string(),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

export interface UseTierArgs {
  provider: string
  opts?: QueryOptions
}

const query = `
  query SelfHostedSeatsAndLicense {
    config {
      seatsUsed
      seatsLimit
      selfHostedLicense {
        expirationDate
      }
    }
  }
`

export const useSelfHostedSeatsAndLicense = ({
  provider,
  opts = {},
}: UseTierArgs) =>
  useQuery({
    queryKey: ['SelfHostedSeatsAndLicense', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
      }).then((res) => {
        const parsedRes = SelfHostedSeatsAndLicenseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.config ?? null
      }),
    ...(!!opts && opts),
  })
