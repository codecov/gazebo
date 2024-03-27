import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const RequestSchema = z.object({
  planAutoActivate: z.boolean().nullable(),
  seatsLimit: z.number().nullable(),
  seatsUsed: z.number().nullable(),
})

export type SelfHostedSettings = z.infer<typeof RequestSchema>

export const useSelfHostedSettings = () => {
  return useQuery({
    queryKey: ['SelfHostedSettings'],
    queryFn: ({ signal }) =>
      Api.get({ path: '/settings', signal }).then((res) => {
        const parsedData = RequestSchema.safeParse(res)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedSettings - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        return parsedData.data
      }),
  })
}
