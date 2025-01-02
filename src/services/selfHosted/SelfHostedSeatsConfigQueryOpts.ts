import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

export const SeatsSchema = z
  .object({
    config: z
      .object({
        seatsUsed: z.number().nullable(),
        seatsLimit: z.number().nullable(),
      })
      .nullable(),
  })
  .nullable()

const query = `
query Seats {
  config {
    seatsUsed
    seatsLimit
  }
}`

interface SelfHostedSeatsConfigQueryArgs {
  provider: string
}

export const SelfHostedSeatsConfigQueryOpts = ({
  provider,
}: SelfHostedSeatsConfigQueryArgs) => {
  return queryOptionsV5({
    queryKey: ['Seats', provider],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, signal }).then((res) => {
        const parsedRes = SeatsSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'SelfHostedSeatsConfigQueryOpts - 404 schema parsing failed',
            error: parsedRes.error,
          })
        }

        return parsedRes?.data?.config ?? null
      }),
  })
}