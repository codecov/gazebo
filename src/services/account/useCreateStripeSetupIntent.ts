import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

export const CreateStripeSetupIntentSchema = z.object({
  createStripeSetupIntent: z.object({
    clientSecret: z.string().nullish(),
    error: z
      .discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('ValidationError'),
        }),
        z.object({
          __typename: z.literal('UnauthenticatedError'),
        }),
        z.object({
          __typename: z.literal('UnauthorizedError'),
        }),
      ])
      .nullish(),
  }),
})

export interface UseCreateStripeSetupIntentArgs {
  provider: Provider
  owner: string
  opts?: {
    enabled?: boolean
  }
}

function createStripeSetupIntent({
  provider,
  owner,
  signal,
}: {
  provider: Provider
  owner: string
  signal?: AbortSignal
}) {
  return Api.graphql({
    provider,
    signal,
    query: `
      mutation CreateStripeSetupIntent($owner: String!) {
        createStripeSetupIntent(input: { owner: $owner }) {
          clientSecret
          error {
            __typename
          }
        }
      }
    `,
    variables: {
      owner,
    },
  })
}

export function useCreateStripeSetupIntent({
  provider,
  owner,
  opts = {},
}: UseCreateStripeSetupIntentArgs) {
  return useQuery({
    queryKey: ['setupIntent', provider, owner],
    queryFn: ({ signal }) =>
      createStripeSetupIntent({ provider, owner, signal }).then((res) => {
        const callingFn = 'useCreateStripeSetupIntent'
        const parsedRes = CreateStripeSetupIntentSchema.safeParse(res.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const error = parsedRes.data.createStripeSetupIntent.error
        if (error?.__typename) {
          return Promise.reject({
            error: error.__typename,
            message: 'Error creating setup intent',
          })
        }

        return parsedRes.data.createStripeSetupIntent
      }),
    ...opts,
  })
}
