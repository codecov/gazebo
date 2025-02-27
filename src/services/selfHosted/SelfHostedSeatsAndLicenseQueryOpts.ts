import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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

const query = `query SelfHostedSeatsAndLicense {
  config {
    seatsUsed
    seatsLimit
    selfHostedLicense {
      expirationDate
    }
  }
}`

export interface SelfHostedSeatsAndLicenseQueryArgs {
  provider: string
}

export const SelfHostedSeatsAndLicenseQueryOpts = ({
  provider,
}: SelfHostedSeatsAndLicenseQueryArgs) =>
  queryOptionsV5({
    queryKey: ['SelfHostedSeatsAndLicense', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
      }).then((res) => {
        const callingFn = 'SelfHostedSeatsAndLicenseQueryOpts'
        const parsedRes = SelfHostedSeatsAndLicenseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes.data?.config ?? null
      }),
  })
