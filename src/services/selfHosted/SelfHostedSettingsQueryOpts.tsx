import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const RequestSchema = z.object({
  config: z.object({
    planAutoActivate: z.boolean().nullable(),
    seatsLimit: z.number().nullable(),
    seatsUsed: z.number().nullable(),
  }),
})

const query = `query SelfHostedSettings {
  config {
    planAutoActivate
    seatsUsed
    seatsLimit
  }
}`

interface SelfHostedSettingsQueryArgs {
  provider: string
}

export const SelfHostedSettingsQueryOpts = ({
  provider,
}: SelfHostedSettingsQueryArgs) => {
  return queryOptionsV5({
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
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'SelfHostedSettingsQueryOpts - 404 schema parsing failed',
            error: parsedData.error,
          })
        }

        return parsedData.data.config
      }),
  })
}
