import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

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
        const parsedRes = SelfHostedSeatsAndLicenseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: `SelfHostedSeatsAndLicenseQueryOpts - 404 Failed to parse`,
            error: parsedRes.error,
          })
        }

        return parsedRes.data?.config ?? null
      }),
  })
