import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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
        const callingFn = 'SelfHostedSettingsQueryOpts'
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        return parsedData.data.config
      }),
  })
}
