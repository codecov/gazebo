import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

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

interface SelfHostedCurrentUserQueryArgs {
  provider: string
}

export const SelfHostedCurrentUserQueryOpts = ({
  provider,
}: SelfHostedCurrentUserQueryArgs) => {
  return queryOptionsV5({
    queryKey: ['SelfHostedCurrentUser', provider],
    queryFn: ({ signal }) =>
      Api.get({ provider, path: '/users/current', signal }).then((res) => {
        const parsedData = SelfHostedCurrentUserSchema.safeParse(res)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'SelfHostedCurrentUserQueryOpts - 404 schema parsing failed',
            error: parsedData.error,
          })
        }
        return parsedData.data
      }),
  })
}