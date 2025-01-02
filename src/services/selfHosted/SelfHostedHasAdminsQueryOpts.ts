import {
  keepPreviousData,
  queryOptions as queryOptionsV5,
} from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

export const HasAdminsSchema = z.object({
  config: z
    .object({
      hasAdmins: z.boolean().nullable(),
    })
    .nullable(),
})

const query = `query HasAdmins { config { hasAdmins } }`

interface SelfHostedHasAdminsQueryArgs {
  provider: string
}

export const SelfHostedHasAdminsQueryOpts = ({
  provider,
}: SelfHostedHasAdminsQueryArgs) => {
  return queryOptionsV5({
    queryKey: ['HasAdmins', provider],
    queryFn: () =>
      Api.graphql({
        provider,
        query,
      }).then((res) => {
        const parsedRes = HasAdminsSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'SelfHostedHasAdminsQueryOpts - 404 schema parsing failed',
            error: parsedRes.error,
          })
        }

        return !!parsedRes?.data?.config?.hasAdmins
      }),
    // this is how TSQuery V5 handles keepPreviousData
    placeholderData: keepPreviousData,
  })
}
