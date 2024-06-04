import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const RequestSchema = z.object({
  config: z.object({
    planAutoActivate: z.boolean().nullable(),
    seatsLimit: z.number().nullable(),
    seatsUsed: z.number().nullable(),
  }),
})

const query = `
  query SelfHostedSettings {
    config {
      planAutoActivate
      seatsUsed
      seatsLimit
    }
  }
`

interface URLParams {
  provider: string
}

export const useSelfHostedSettings = () => {
  const { provider } = useParams<URLParams>()
  return useQuery({
    queryKey: ['SelfHostedSettings', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedSettings - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        return parsedData.data.config
      }),
  })
}
