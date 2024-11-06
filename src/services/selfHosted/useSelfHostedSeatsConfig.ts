import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

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
}
`

interface URLParams {
  provider: string
}

export const useSelfHostedSeatsConfig = (options = {}) => {
  const { provider } = useParams<URLParams>()

  return useQuery({
    queryKey: ['Seats', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, signal }).then((res) => {
        const parsedRes = SeatsSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedSeatsConfig - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        return parsedRes ?? null
      }),
    select: ({ data }) => data?.config,
    ...options,
  })
}
