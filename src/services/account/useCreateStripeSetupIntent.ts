import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

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
      ])
      .nullish(),
  }),
})

export interface UseCreateStripeSetupIntentArgs {
  provider: string
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
  provider: string
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
        const parsedRes = CreateStripeSetupIntentSchema.safeParse(res.data)
        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useStripeSetupIntent - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data.createStripeSetupIntent
      }),
    ...opts,
  })
}
