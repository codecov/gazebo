import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const SelfHostedCurrentUserSchema = z
  .object({
    activated: z.boolean().nullish(),
    email: z.string().nullish(),
    isAdmin: z.boolean().nullish(),
    name: z.string().nullish(),
    ownerid: z.number().nullish(),
    username: z.string().nullish(),
  })
  .nullable()

interface URLParams {
  provider: string
}

export const useSelfHostedCurrentUser = (options = {}) => {
  const { provider } = useParams<URLParams>()

  return useQuery({
    queryKey: ['SelfHostedCurrentUser', provider],
    queryFn: ({ signal }) =>
      Api.get({ provider, path: '/users/current', signal }).then((res) => {
        const parsedData = SelfHostedCurrentUserSchema.safeParse(res)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedCurrentUser - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }
        return parsedData.data
      }),
    ...options,
  })
}
