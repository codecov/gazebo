import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

export const StripeSetupIntentSchema = z.object({
  clientSecret: z.string(),
})

export interface UseStripeSetupIntentArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

function fetchStripeSetupIntent({
  provider,
  owner,
  signal,
}: {
  provider: string
  owner: string
  signal?: AbortSignal
}) {
  const path = `/${provider}/${owner}/account-details/setup_intent`
  return Api.get({ path, provider, signal })
}

export function useStripeSetupIntent({
  provider,
  owner,
  opts = {},
}: UseStripeSetupIntentArgs) {
  return useQuery({
    queryKey: ['setupIntent', provider, owner],
    queryFn: ({ signal }) =>
      fetchStripeSetupIntent({ provider, owner, signal }).then((res) => {
        const parsedRes = StripeSetupIntentSchema.safeParse(res)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useStripeSetupIntent - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data
      }),
    ...opts,
  })
}
